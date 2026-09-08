export function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

// Some editors/inspectors can (incorrectly) treat utility-only files as scripts.
// This explicit empty export forces module interpretation everywhere.
export {};



