import { useState } from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./Toolbar.module.scss";

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
  backendReady: boolean;
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
  backendReady,
}: ToolbarProps) {
  const [exportAnchorEl, setExportAnchorEl] = useState<HTMLElement | null>(null);
  const exportOpen = Boolean(exportAnchorEl);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const disabled = !backendReady;

  return (
    <header className={styles.toolbar}>
      <div className={styles.actions}>
        <Button variant="contained" onClick={onOpenFile} disabled={disabled}>
          Select File
        </Button>
      </div>

      <div className={styles.actions}>
        <ButtonGroup variant="contained">
          <Button
            onClick={onCompile}
            disabled={disabled || !hasFile || isCompiling}
          >
            {isCompiling ? "Compiling..." : disabled ? "Starting backend..." : "Compile"}
          </Button>
          <Button onClick={onSettings} aria-label="Settings" disabled={disabled}>
            <span className="material-symbols-outlined">settings</span>
          </Button>
        </ButtonGroup>

        <Button
          variant="contained"
          onClick={handleExportClick}
          disabled={disabled || !canExport}
        >
          Export <span className="material-symbols-outlined">arrow_drop_down</span>
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
            disabled={disabled || !canExport}
            sx={{ fontWeight: 800 }}
          >
            Export PDF
          </MenuItem>
          <MenuItem
            onClick={() => {
              onExportXml();
              handleExportClose();
            }}
            disabled={disabled || !canExportXml}
          >
            Export XML
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
