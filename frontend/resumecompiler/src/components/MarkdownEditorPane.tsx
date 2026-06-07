import { useRef, useCallback } from "react";
import { Pane } from "./Pane.tsx";

const TAB_SIZE = 4;
const TAB = " ".repeat(TAB_SIZE);

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== "Tab") return;
      event.preventDefault();

      const { selectionStart, selectionEnd } = event.currentTarget;
      if (selectionStart === undefined || selectionEnd === undefined) return;

      const isShift = event.shiftKey;
      const before = markdown.substring(0, selectionStart);
      const after = markdown.substring(selectionEnd);
      const selected = markdown.substring(selectionStart, selectionEnd);

      const lineStart = before.lastIndexOf("\n") + 1;
      const nextNewline = markdown.indexOf("\n", selectionEnd);
      const lineEnd = nextNewline === -1 ? markdown.length : nextNewline;

      if (isShift) {
        if (selected.includes("\n")) {
          const portion = markdown.substring(lineStart, lineEnd);
          const portionLines = portion.split("\n");
          const dedentedLines = portionLines.map((l) => {
            const n = Math.min(l.length - l.trimStart().length, TAB_SIZE);
            return l.substring(n);
          });
          const newPortion = dedentedLines.join("\n");
          const removed = portionLines.reduce(
            (sum, l) => sum + Math.min(l.length - l.trimStart().length, TAB_SIZE),
            0,
          );
          const newValue = markdown.substring(0, lineStart) + newPortion + markdown.substring(lineEnd);
          const newStart = Math.max(selectionStart - (before.length - lineStart > 0 ? TAB_SIZE : 0), lineStart);
          onMarkdownChange(newValue);
          requestAnimationFrame(() => {
            textareaRef.current?.setSelectionRange(newStart, newStart + Math.max(0, selectionEnd - selectionStart - removed));
          });
        } else {
          const lineText = markdown.substring(lineStart, lineEnd);
          const spaces = lineText.length - lineText.trimStart().length;
          if (spaces > 0) {
            const n = Math.min(spaces, TAB_SIZE);
            const newValue = markdown.substring(0, lineStart) + lineText.substring(n) + markdown.substring(lineEnd);
            const newCursor = Math.max(selectionStart - n, lineStart);
            onMarkdownChange(newValue);
            requestAnimationFrame(() => {
              textareaRef.current?.setSelectionRange(newCursor, newCursor);
            });
          }
        }
      } else {
        if (selected.includes("\n")) {
          const portion = markdown.substring(lineStart, lineEnd);
          const portionLines = portion.split("\n");
          const indentedLines = portionLines.map((l) => TAB + l);
          const newPortion = indentedLines.join("\n");
          const newValue = markdown.substring(0, lineStart) + newPortion + markdown.substring(lineEnd);
          const added = portionLines.length * TAB_SIZE;
          const newStart = selectionStart + (selectionStart === lineStart ? TAB_SIZE : 0);
          onMarkdownChange(newValue);
          requestAnimationFrame(() => {
            textareaRef.current?.setSelectionRange(newStart, newStart + (selectionEnd - selectionStart) + added);
          });
        } else {
          const newValue = before + TAB + after;
          const newCursor = selectionStart + TAB_SIZE;
          onMarkdownChange(newValue);
          requestAnimationFrame(() => {
            textareaRef.current?.setSelectionRange(newCursor, newCursor);
          });
        }
      }
    },
    [markdown, onMarkdownChange],
  );

  return (
    <Pane title="Editor">
      <textarea
        ref={textareaRef}
        className="editor"
        value={markdown}
        onChange={(event) => onMarkdownChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={!hasFile}
        spellCheck={false}
      />
    </Pane>
  );
}
