import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "@tauri-apps/api/core";

export interface FontNamesResponse {
  names: string[];
  default: string;
}

export class ApiClient {
  static cachedApiBaseUrl: string | null = null;
  static backendHealthIsVerified = false;

  static async waitForBackendReady(baseUrl: string): Promise<void> {
    const healthUrl = `${baseUrl}/health`;

    let delay = 50;
    const maxDelay = 500;

    while (true) {
      try {
        const response = await fetch(healthUrl, { method: "GET" });
        if (response.ok) {
          this.backendHealthIsVerified = true;
          return;
        }
      } catch {
        // Ignore errors, keep polling
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  static async resolveApiBaseUrl(): Promise<string> {
    if (this.cachedApiBaseUrl) {
      return this.cachedApiBaseUrl;
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

    const url = `http://127.0.0.1:${port}`;
    if (!this.backendHealthIsVerified) {
      await this.waitForBackendReady(url);
    }

    this.cachedApiBaseUrl = url;
    return this.cachedApiBaseUrl;
  }

  static async getCompiledPdfEndpoint(): Promise<string> {
    const base = await this.resolveApiBaseUrl();
    return `${base}/pdf`;
  }

  static async getCompiledXmlEndpoint(): Promise<string> {
    const base = await this.resolveApiBaseUrl();
    return `${base}/xml`;
  }

  static async getFontNames(): Promise<FontNamesResponse> {
    const base = await this.resolveApiBaseUrl();
    const response = await fetch(`${base}/font-names`);
    if (!response.ok) {
      throw new Error("Failed to fetch font names");
    }
    return response.json();
  }
}
