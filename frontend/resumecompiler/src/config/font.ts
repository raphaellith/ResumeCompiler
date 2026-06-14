export interface FontOption {
  label: string;
  value: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { label: "Times New Roman", value: "times-new-roman" },
  { label: "Computer Modern", value: "computer-modern" },
  { label: "Fira Sans", value: "fira-sans" },
  { label: "Roboto", value: "roboto" },
  { label: "Noto Sans", value: "noto-sans" },
  { label: "Source Sans Pro", value: "source-sans-pro" },
  { label: "Cormorant Garamond", value: "cormorant-garamond" },
  { label: "Charter", value: "charter" },
];

export const DEFAULT_FONT = "times-new-roman";
