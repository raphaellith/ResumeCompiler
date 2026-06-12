import { useEffect, useRef, useState } from "react";

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
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsExportMenuOpen(false);
      }
    }
    if (isExportMenuOpen) {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExportMenuOpen]);

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

        <div className="action-with-menu" ref={menuRef}>
          <button
            type="button"
            className="action"
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
          >
            Export ▼
          </button>

          {isExportMenuOpen && (
            <ul className="export-menu" role="menu">
              <li role="none">
                <button
                  type="button"
                  className="export-menu-item export-menu-item-primary"
                  role="menuitem"
                  onClick={() => {
                    onExport();
                    setIsExportMenuOpen(false);
                  }}
                  disabled={!canExport}
                >
                  Export PDF
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  className="export-menu-item export-menu-item-secondary"
                  role="menuitem"
                  onClick={() => {
                    onExportXml();
                    setIsExportMenuOpen(false);
                  }}
                  disabled={!canExportXml || isExportingXml}
                >
                  {isExportingXml ? "Exporting XML..." : "Export XML"}
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
