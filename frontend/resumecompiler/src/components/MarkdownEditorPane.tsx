import { Pane } from "./Pane.tsx";

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
  return (
    <Pane title="Editor">
      <textarea
        className="editor"
        value={markdown}
        onChange={(event) => onMarkdownChange(event.target.value)}
        disabled={!hasFile}
        spellCheck={false}
      />
    </Pane>
  );
}
