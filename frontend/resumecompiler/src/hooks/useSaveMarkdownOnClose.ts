import { useCallback, useEffect } from "react";
import { writeTextFile } from "@tauri-apps/plugin-fs";

export type UseSaveMarkdownOnCloseParams = {
  filePath: string | null;
  markdown: string;
  onError?: (error: unknown) => void;
};

/**
 * Best-effort persistence on window close (safety net; auto-save on every change
 * handles the primary persistence).
 *
 * - On browser refresh/tab close: saves via `beforeunload`.
 * - In Tauri: intercepts close request, saves, then lets the close proceed.
 */
export function useSaveMarkdownOnClose({
  filePath,
  markdown,
  onError,
}: UseSaveMarkdownOnCloseParams) {
  const saveToSourceFile = useCallback(async () => {
    if (!filePath) {
      return;
    }

    // Skip save for relative paths (browser File API only provides a bare filename).
    if (!/^[/\\]|[A-Za-z]:[/\\]/.test(filePath)) {
      return;
    }

    try {
      await writeTextFile(filePath, markdown);
    } catch (error) {
      console.error("Failed to save markdown file.", error);
      onError?.(error);
    }
  }, [filePath, markdown, onError]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      void saveToSourceFile();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    let unlisten: (() => void) | null = null;
    const registerCloseHandler = async () => {
      try {
        const windowApi = await import("@tauri-apps/api/window");
        const currentWindow = windowApi.getCurrentWindow();

        unlisten = await currentWindow.onCloseRequested(async () => {
          await saveToSourceFile();
        });
      } catch (error) {
        console.warn("Window close handler unavailable.", error);
      }
    };

    void registerCloseHandler();

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (unlisten) {
        unlisten();
      }
    };
  }, [saveToSourceFile]);

  return { saveToSourceFile };
}
