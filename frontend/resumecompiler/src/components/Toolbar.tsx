import { useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export type ToolbarProps = {
  hasFile: boolean;
  isCompiling: boolean;
  canExport: boolean;
  canExportXml: boolean;
  onOpenFile: () => void;
  onCompile: () => void;
  onSettings: () => void;
  onExport: () => void;
  onExportXml: () => void;
};

export function Toolbar({
  hasFile,
  isCompiling,
  canExport,
  canExportXml,
  onOpenFile,
  onCompile,
  onSettings,
  onExport,
  onExportXml,
}: ToolbarProps) {
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLElement | null>(null);
  const exportOpen = Boolean(exportAnchorEl);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  return (
    <header className="toolbar">
      <div className="actions">
        <Button variant="contained" onClick={onOpenFile}>
          Select File
        </Button>
      </div>

      <div className="actions">
        <ButtonGroup variant="contained">
          <Button
            onClick={onCompile}
            disabled={!hasFile || isCompiling}
          >
            {isCompiling ? "Compiling..." : "Compile"}
          </Button>
          <Button onClick={onSettings} aria-label="Settings">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
          </Button>
        </ButtonGroup>

        <Button
          variant="contained"
          onClick={handleExportClick}
          disabled={!canExport}
        >
          Export ▼
        </Button>

        <Menu
          anchorEl={exportAnchorEl}
          open={exportOpen}
          onClose={handleExportClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              onExport();
              handleExportClose();
            }}
            disabled={!canExport}
            sx={{ fontWeight: 800 }}
          >
            Export PDF
          </MenuItem>
          <MenuItem
            onClick={() => {
              onExportXml();
              handleExportClose();
            }}
            disabled={!canExportXml}
          >
            Export XML
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
