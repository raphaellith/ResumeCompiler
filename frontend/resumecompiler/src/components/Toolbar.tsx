import { type ChangeEvent, useRef } from "react";

export type ToolbarProps = {
  hasFile: boolean;
  isCompiling: boolean;
  canExport: boolean;
  onSelectFile: (file: File) => void;
  onCompile: () => void;
  onExport: () => void;
};

export function Toolbar({
  hasFile,
  isCompiling,
  canExport,
  onSelectFile,
  onCompile,
  onExport,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    onSelectFile(file);
    event.target.value = "";
  };

  return (
    <header className="toolbar">
      <div className="actions">
        <button type="button" className="action" onClick={() => fileInputRef.current?.click()}>
          Select File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,text/markdown"
          onChange={handleFileInputChange}
          className="file-input"
        />
      </div>

      <div className="actions">
        <button
          type="button"
          className="action"
          onClick={onCompile}
          disabled={!hasFile || isCompiling}
        >
          {isCompiling ? "Compiling..." : "Compile"}
        </button>

        <button
          type="button"
          className="action primary"
          onClick={onExport}
          disabled={!canExport}
        >
          Export PDF
        </button>
      </div>
    </header>
  );
}
