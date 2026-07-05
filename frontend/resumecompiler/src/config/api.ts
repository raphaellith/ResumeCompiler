import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@tauri-apps/api/core";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

let cachedApiBaseUrl: string | null = null;

async function resolveApiBaseUrl(): Promise<string> {
  if (cachedApiBaseUrl) {
    return cachedApiBaseUrl;
  }

  if (isTauri()) {
    try {
      const port = await invoke<number>("get_backend_port");
      if (port > 0) {
        cachedApiBaseUrl = `http://127.0.0.1:${port}`;
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
  return `${base}/pdf/`;
}

export async function getCompiledXmlEndpoint(): Promise<string> {
  const base = await resolveApiBaseUrl();
  return `${base}/xml/`;
}
