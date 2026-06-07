export function getFileDisplayName(filePath: string | null | undefined): string {
  if (!filePath) {
    return "None";
  }

  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] || filePath;
}

export function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

// Some editors/inspectors can (incorrectly) treat utility-only files as scripts.
// This explicit empty export forces module interpretation everywhere.
export {};



