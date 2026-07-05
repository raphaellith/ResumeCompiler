use std::net::TcpListener;
use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

struct SidecarState {
    backend_port: u16,
    child: Mutex<Option<tauri_plugin_shell::process::CommandChild>>,
}

impl Drop for SidecarState {
    fn drop(&mut self) {
        if let Ok(mut guard) = self.child.lock() {
            if let Some(child) = guard.take() {
                let _ = child.kill();
            }
        }
    }
}

#[tauri::command]
fn get_backend_port(state: tauri::State<SidecarState>) -> u16 {
    state.backend_port
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let (port, child) = match app.shell().sidecar("backend") {
                Ok(sidecar) => match TcpListener::bind("127.0.0.1:0") {
                    Ok(listener) => {
                        let port = listener.local_addr().map(|a| a.port()).unwrap_or(0);
                        drop(listener);
                        match sidecar.args(["--port", &port.to_string()]).spawn() {
                            Ok((mut rx, child)) => {
                                tauri::async_runtime::spawn(async move {
                                    while let Some(event) = rx.recv().await {
                                        if let CommandEvent::Stderr(line) = event {
                                            eprintln!(
                                                "[backend] {}",
                                                String::from_utf8_lossy(&line)
                                            );
                                        }
                                    }
                                });
                                (port, Some(child))
                            }
                            Err(e) => {
                                eprintln!("Failed to spawn sidecar: {e}");
                                (0, None)
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to bind port for sidecar: {e}");
                        (0, None)
                    }
                },
                Err(e) => {
                    eprintln!("Sidecar binary not found (dev mode): {e}");
                    (0, None)
                }
            };

            app.manage(SidecarState {
                backend_port: port,
                child: Mutex::new(child),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_backend_port])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
