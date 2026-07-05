# Release Build & CI/CD Design

## Overview

Two-process architecture retained for production. Python backend is frozen into a
standalone executable (sidecar) via PyInstaller and bundled inside the Tauri
application package. LaTeX (`pdflatex`) is **not** bundled — detected at runtime.

## Sidecar Architecture

```
┌─────────────────────────────────┐
│  Tauri Desktop Shell (Rust)     │
│  ├─ WebView (React SPA)         │
│  ├─ Sidecar (Python binary)     │  ← random port
│  │    └─ FastAPI :{random_port} │
│  └─ Shell plugin (spawn/kill)   │
└─────────────────────────────────┘
```

- **Rust** (`src-tauri/src/lib.rs`): On `setup()`, binds `TcpListener` to
  `127.0.0.1:0` to get a random free port, then spawns the Python binary via
  `tauri_plugin_shell::ShellExt::sidecar("backend")` passing `--port {port}`.
  The `SidecarState` struct (Tauri-managed state) stores the port and child
  handle; on `Drop` the child is killed.
- **Python** (`backend/run.py`): Command-line entrypoint that parses `--port`
  and starts `uvicorn` on that port.
- **Frontend** (`src/config/api.ts`): Calls `invoke("get_backend_port")` to
  retrieve the dynamic port in Tauri mode; falls back to
  `VITE_RESUME_COMPILER_API_BASE_URL` (or `http://localhost:8000`) in dev/browser.
- **Dev mode**: The sidecar binary won't exist at `src-tauri/binaries/` during
  development. The Rust setup gracefully handles this: `sidecar()` returns an
  error → `backend_port` set to `0` → frontend falls back to the default URL.
  Developers continue to run `uvicorn backend.controller.api_controller:app`
  manually as before.

## LaTeX Detection

LaTeX is not bundled (hundreds of MB, platform-specific). Detection:

1. `backend/service/markdown_to_pdf_bytes_compilation_service.py` — the
   `_run_pdflatex()` function catches `FileNotFoundError` / `OSError` when
   `pdflatex` is not found and raises `PdfLatexNotFoundError`.
2. `backend/controller/api_controller.py` — catches `PdfLatexNotFoundError` and
   returns `HTTP 502` with JSON body `{"error": "pdflatex_not_found", "message": "..."}`.
3. `frontend/.../usePdfCompilation.ts` — parses the 502 response body, detects
   `error === "pdflatex_not_found"`, and sets `compileError` to the sentinel
   string `"LATEX_NOT_FOUND"`.
4. `frontend/.../CompilationErrorMessage.tsx` — checks for the sentinel and
   renders a user-friendly warning with OS-specific install instructions
   (MacTeX on macOS, MiKTeX on Windows, TeX Live on Linux).

## Port Negotiation

Port is dynamically allocated to avoid conflicts:

1. Rust binds `TcpListener` to `127.0.0.1:0` → OS assigns a free port.
2. Port is passed as CLI argument `--port {port}` to the sidecar.
3. Port is stored in Tauri-managed state and exposed via `get_backend_port`
   command.
4. Frontend calls the command on startup.

## Bundle Configuration

- `src-tauri/tauri.conf.json`: `bundle.externalBin` lists `["binaries/backend"]`.
- Sidecar binaries are placed at `src-tauri/binaries/backend-{target-triple}` by
  CI, matching Tauri's naming convention.
- `macOS.signing.skip: true` — builds are unsigned (no Apple Developer account
  required for distribution; users Ctrl+Open to bypass Gatekeeper).

## CI/CD Pipeline

File: `.github/workflows/release.yml`

**Trigger**: Push of a tag matching `v*` (e.g., `v1.0.0`).

**Matrix** (single-job-per-platform):

| Runner | Target triple | Bundle |
|---|---|---|
| `macos-latest` (ARM) | `aarch64-apple-darwin` | `.dmg` |
| `macos-13` (Intel) | `x86_64-apple-darwin` | `.dmg` |
| `windows-latest` | `x86_64-pc-windows-msvc` | `.msi` |

**Per-platform steps**:
1. Setup Python, install deps + PyInstaller
2. `pyinstaller --onefile --name backend --add-data ... backend/run.py`
3. Copy binary to `src-tauri/binaries/backend-{target}`
4. Setup Node + `npm ci`
5. Setup Rust + target
6. `npm run tauri build`
7. Upload `.dmg` / `.msi` as build artifact

**Post-matrix**: A `create-release` job (on `ubuntu-latest`, needs `build`)
downloads all artifacts and creates a GitHub Release with generated release notes.

## PyInstaller Configuration

- Entrypoint: `backend/run.py`
- Hidden imports: `uvicorn.*` submodules (discovered via
  `PyInstaller.utils.hooks.collect_submodules`)
- Data files: `backend/model/resources/preamble.tex` → bundled at
  `backend/model/resources/preamble.tex` relative to bundle root
- One-file executable mode (`--onefile`)

## Key Files

| File | Purpose |
|---|---|
| `backend/run.py` | PyInstaller entrypoint, parses `--port` |
| `backend/build.spec` | PyInstaller spec file (local builds) |
| `src-tauri/src/lib.rs` | Sidecar spawn, state, `get_backend_port` command |
| `src-tauri/tauri.conf.json` | `externalBin`, macOS signing skip |
| `src-tauri/capabilities/default.json` | Shell permissions |
| `src/config/api.ts` | Dynamic endpoint resolution |
| `src/hooks/usePdfCompilation.ts` | LaTeX error detection from 502 response |
| `src/components/CompilationErrorMessage/` | LaTeX install instructions UI |
| `.github/workflows/release.yml` | CI/CD pipeline |
