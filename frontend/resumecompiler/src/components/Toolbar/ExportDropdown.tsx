import React, { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export type ExportDropdownProps = {
  exportDisabled: boolean;
  exportXmlDisabled: boolean;
  onExport: () => void;
  onExportXml: () => void;
};

export function ExportDropdown({
  exportDisabled,
  exportXmlDisabled,
  onExport,
  onExportXml,
}: ExportDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        disabled={exportDisabled && exportXmlDisabled}
      >
        Export <span className="material-symbols-outlined">arrow_drop_down</span>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            onExport();
            handleClose();
          }}
          disabled={exportDisabled}
        >
          Export PDF
        </MenuItem>
        <MenuItem
          onClick={() => {
            onExportXml();
            handleClose();
          }}
          disabled={exportXmlDisabled}
        >
          Export XML
        </MenuItem>
      </Menu>
    </>
  );
}