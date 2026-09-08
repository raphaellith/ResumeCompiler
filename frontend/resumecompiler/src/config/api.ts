import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@tauri-apps/api/core";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

let cachedApiBaseUrl: string | null = null;
let backendHealthIsChecked = false;

async function waitForBackendReady(baseUrl: string): Promise<void> {
  const healthUrl = `${baseUrl}/health`;

  let delay = 50;
  const maxDelay = 500;
  const timeout = 10000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(healthUrl, { method: "GET" });
      if (response.ok) {
        backendHealthIsChecked = true;
        return;
      }
    } catch {
      // Ignore errors, keep polling
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    delay = Math.min(delay * 2, maxDelay);
  }
  throw new Error("Backend failed to start within timeout");
}

async function resolveApiBaseUrl(): Promise<string> {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  if (isTauri()) {
    try {
      const port = await invoke<number>("get_backend_port");
      if (port > 0) {
        const url = `http://127.0.0.1:${port}`;
        if (!backendHealthIsChecked) {
          await waitForBackendReady(url);
        }
        cachedApiBaseUrl = url;
        return cachedApiBaseUrl;
      }
    } catch {
      // get_backend_port not available, fall through to default
    }
  }

  const resolved = (
    import.meta.env.VITE_RESUME_COMPILER_API_BASE_URL ?? DEFAULT_API_BASE_URL
  ).replace(/\/+$/, "");
  cachedApiBaseUrl = resolved;
  return resolved;
}

export async function getCompiledPdfEndpoint(): Promise<string> {
  const base = await resolveApiBaseUrl();
  return `${base}/pdf`;
}

export async function getCompiledXmlEndpoint(): Promise<string> {
  const base = await resolveApiBaseUrl();
  return `${base}/xml`;
}
