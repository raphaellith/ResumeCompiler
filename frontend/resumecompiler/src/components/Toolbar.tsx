export type ToolbarProps = {
  hasFile: boolean;
  isCompiling: boolean;
  canExport: boolean;
  canExportXml: boolean;
  isExportingXml: boolean;
  onOpenFile: () => void;
  onCompile: () => void;
  onExport: () => void;
  onExportXml: () => void;
};

export function Toolbar({
  hasFile,
  isCompiling,
  canExport,
  canExportXml,
  isExportingXml,
  onOpenFile,
  onCompile,
  onExport,
  onExportXml,
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
          className="action"
          onClick={onExport}
          disabled={!canExport}
        >
          Export PDF
        </button>

        <button
          type="button"
          className="action"
          onClick={onExportXml}
          disabled={!canExportXml || isExportingXml}
        >
          {isExportingXml ? "Exporting XML..." : "Export XML"}
        </button>
      </div>
    </header>
  );
}
