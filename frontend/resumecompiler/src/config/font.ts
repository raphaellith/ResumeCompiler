import { ApiClient } from "./apiClient.ts";

export class FontOption {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  asQueryParam(): string {
    return this.name.trim().toLowerCase().replace(/\s+/g, "-");
  }
}

interface FontNamesEndpointResponse {
  names: string[];
  default: string;
}

interface FontInformation {
  fontOptions: FontOption[];
  defaultFontOption: FontOption;
}

export class FontService {
  private static cachedFontInformation: FontInformation | null = null;

  public static async resolveFontInformation(): Promise<FontInformation> {
    if (this.cachedFontInformation) {
      return this.cachedFontInformation;
    }

    const response = await ApiClient.getResponseFromGetRequestToFontNamesEndpoint().then(r => r.json()) as FontNamesEndpointResponse;

    const fontOptions = response.names.map((name) => new FontOption(name));
    const defaultFontOption = fontOptions.find((option) => option.name === response.default);

    if (!defaultFontOption) {
      throw new Error(`Default font "${response.default}" not found in font options`);
    }

    this.cachedFontInformation = { fontOptions, defaultFontOption}
    return this.cachedFontInformation;
  }

  public static async resolveFontOptions(): Promise<FontOption[]> {
    return this.resolveFontInformation().then(info => info.fontOptions);
  }

  public static async resolveDefaultFontOption(): Promise<FontOption> {
    return this.resolveFontInformation().then(info => info.defaultFontOption);
  }
}
