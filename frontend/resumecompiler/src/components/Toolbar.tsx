export type ToolbarProps = {
  hasFile: boolean;
  isCompiling: boolean;
  canExport: boolean;
  onOpenFile: () => void;
  onCompile: () => void;
  onExport: () => void;
};

export function Toolbar({
  hasFile,
  isCompiling,
  canExport,
  onOpenFile,
  onCompile,
  onExport,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="actions">
        <button type="button" className="action" onClick={onOpenFile}>
          Select File
        </button>
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
