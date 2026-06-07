import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { writeTextFile } from "@tauri-apps/plugin-fs";

function getFileDisplayName(filePath: string | null): string {
  if (!filePath) {
    return "None";
  }

  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] || filePath;
}

export type LoadedMarkdownFile = {
  markdown: string;
  filePath: string;
};

export type UseMarkdownDocumentResult = {
  markdown: string;
  filePath: string | null;
  fileDisplayName: string;
  hasFile: boolean;

  /** Update markdown contents and auto-save to the source file. */
  updateMarkdown: (next: string) => void;

  /**
   * Load a markdown file into state.
   * Returns the loaded content/path so callers can trigger downstream effects (e.g. compilation).
   */
  loadFile: (file: File) => Promise<LoadedMarkdownFile>;
};

export function useMarkdownDocument(): UseMarkdownDocumentResult {
  const [markdown, setMarkdown] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const filePathRef = useRef(filePath);
  filePathRef.current = filePath;

  const hasFile = filePath !== null;
  const fileDisplayName = useMemo(() => getFileDisplayName(filePath), [filePath]);

  const updateMarkdown = useCallback((next: string) => {
    setMarkdown(next);
  }, []);

  const loadFile = useCallback(async (file: File): Promise<LoadedMarkdownFile> => {
    const text = await file.text();
    const path = (file as File & { path?: string }).path ?? file.name;

    setMarkdown(text);
    setFilePath(path);

    return { markdown: text, filePath: path };
  }, []);

  useEffect(() => {
    const currentPath = filePathRef.current;
    if (!currentPath || !markdown) {
      return;
    }

    // Browser File API only provides a bare filename (relative path).
    // Tauri's fs plugin rejects relative paths as "forbidden path" —
    // only attempt auto-save when we have an absolute path.
    if (!/^[/\\]|[A-Za-z]:[/\\]/.test(currentPath)) {
      return;
    }

    const saveTimeout = setTimeout(async () => {
      try {
        await writeTextFile(currentPath, markdown);
      } catch (error) {
        console.error("Failed to auto-save markdown file.", error);
      }
    }, 300);

    return () => clearTimeout(saveTimeout);
  }, [markdown]);

  return {
    markdown,
    filePath,
    fileDisplayName,
    hasFile,
    updateMarkdown,
    loadFile,
  };
}
