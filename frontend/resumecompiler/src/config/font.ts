const FONT_NAMES: string[] = [
  "Times New Roman",
  "Computer Modern",
  "Fira Sans",
  "Roboto",
  "Noto Sans",
  "Source Sans Pro",
  "Cormorant Garamond",
  "Charter"
]


export class FontOption {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  asQueryParam(): string {
    // Convert name from proper case to kebab case
    return this.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
}


export const FONT_OPTIONS: FontOption[] = FONT_NAMES.map((name) => new FontOption(name))
export const DEFAULT_FONT_OPTION: FontOption = FONT_OPTIONS[0];
