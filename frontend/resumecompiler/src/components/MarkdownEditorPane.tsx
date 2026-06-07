import { useCallback, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Pane } from "./Pane.tsx";

const DEFAULT_FONT_SIZE = 12;
const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 24;
const FONT_SIZE_STEP = 2;

export type MarkdownEditorPaneProps = {
  hasFile: boolean;
  markdown: string;
  onMarkdownChange: (next: string) => void;
};

export function MarkdownEditorPane({
  hasFile,
  markdown,
  onMarkdownChange,
}: MarkdownEditorPaneProps) {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal,
        () => setFontSize((prev) => Math.min(prev + FONT_SIZE_STEP, MAX_FONT_SIZE)),
      );

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus,
        () => setFontSize((prev) => Math.max(prev - FONT_SIZE_STEP, MIN_FONT_SIZE)),
      );

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit0,
        () => setFontSize(DEFAULT_FONT_SIZE),
      );
    },
    [],
  );

  const handleChange = useCallback(
    (value: string | undefined) => onMarkdownChange(value ?? ""),
    [onMarkdownChange],
  );

  return (
    <Pane title="Editor">
      <Editor
        language="markdown"
        value={markdown}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          readOnly: !hasFile,
          fontSize,
          fontFamily: '"JetBrains Mono", "SFMono-Regular", "Menlo", "Consolas", monospace',
          fontWeight: "500",
          tabSize: 4,
          insertSpaces: true,
          minimap: { enabled: false },
          wordWrap: "on",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderWhitespace: "selection",
          padding: { top: 14, bottom: 14 },
        }}
      />
    </Pane>
  );
}
