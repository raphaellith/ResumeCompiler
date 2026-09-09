import { getFontNames, type FontNamesResponse } from "./api";

let cachedFontNames: FontNamesResponse | null = null;

export class FontOption {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  asQueryParam(): string {
    return this.name.trim().toLowerCase().replace(/\s+/g, "-");
  }
}

async function resolveFontNames(): Promise<FontNamesResponse> {
  if (cachedFontNames) {
    return cachedFontNames;
  }
  cachedFontNames = await getFontNames();
  return cachedFontNames;
}

export async function fetchFontOptions(): Promise<FontOption[]> {
  const response = await resolveFontNames();
  return response.names.map((name) => new FontOption(name));
}

export async function fetchDefaultFontOption(): Promise<FontOption> {
  const response = await resolveFontNames();
  const defaultName = response.default;
  const options = await fetchFontOptions();
  const defaultOption = options.find((opt) => opt.name === defaultName);
  if (!defaultOption) {
    throw new Error(`Default font "${defaultName}" not found in font options`);
  }
  return defaultOption;
}