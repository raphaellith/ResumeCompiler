import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@tauri-apps/api/core";

export class ApiClient {
  static cachedBaseUrl: string | null = null;
  static backendIsReady = false;

  private static async resolveApiBaseUrl(): Promise<string> {
    if (this.cachedBaseUrl) {
      return this.cachedBaseUrl;
    }

    if (!isTauri()) {
      throw new Error("Backend API is only available in Tauri mode");
    }

    let port: number;
    try {
      port = await invoke<number>("get_backend_port");
    } catch (error) {
      throw new Error(
        `Failed to retrieve backend port from Tauri: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(`Invalid backend port received from Tauri: ${port}`);
    }

    this.cachedBaseUrl = `http://127.0.0.1:${port}`;
    return this.cachedBaseUrl;
  }

  private static async getEndpoint(path: string, params?: Record<string, string>): Promise<string> {
    const base = await this.resolveApiBaseUrl();
    const endpoint = `${base}/${path}`;
    if (!params) {
      return endpoint;
    }

    const searchParams = new URLSearchParams(params).toString();
    if (!searchParams) {
      return endpoint;
    }

    return `${endpoint}?${searchParams}`;
  }

  public static async ensureBackendIsReady(): Promise<void> {
    if (this.backendIsReady) {
      return;
    }

    const healthUrl = await this.getEndpoint("health");

    let delay = 50;
    const maxDelay = 500;

    while (true) {
      try {
        const response = await fetch(healthUrl, { method: "GET" });
        if (response.ok) {
          this.backendIsReady = true;
          return;
        }
      } catch {
        // Ignore errors, keep polling
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  private static async getResponseFromEndpoint(endpointPath: string, requestInit?: RequestInit, queryParams?: Record<string, string>): Promise<Response> {
    await this.ensureBackendIsReady();
    const endpoint = await this.getEndpoint(endpointPath, queryParams);
    const response = await fetch(endpoint, requestInit);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorType = errorBody?.error || "UnknownError";
      const errorMessage = errorBody?.message || `Backend returned ${response.status}.`;
      throw new Error(`${errorType}: ${errorMessage}`);
    }

    return response;
  }

  public static async getResponseFromPostRequestToPdfEndpoint(markdown: string, font?: string): Promise<Response> {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
      body: JSON.stringify({ markdown }),
    };

    return this.getResponseFromEndpoint(
      "pdf",
      requestOptions,
      font ? { font } : undefined
    );
  }

  public static async getResponseFromPostRequestToXmlEndpoint(markdown: string): Promise<Response> {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/xml",
      },
      body: JSON.stringify({ markdown }),
    };

    return this.getResponseFromEndpoint("pdf", requestOptions);
  }

  public static async getResponseFromGetRequestToFontNamesEndpoint(): Promise<Response> {
    return this.getResponseFromEndpoint("font-names")
  }
}
