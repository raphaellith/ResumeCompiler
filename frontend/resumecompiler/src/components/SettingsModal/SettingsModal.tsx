import { useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FONT_OPTIONS, type FontOption } from "../../config/font";
import { SettingRow } from "../SettingRow/SettingRow";
import vars from "../../styles/variables.module.scss";

export type SettingsModalProps = {
  isOpen: boolean;
  initialFont: string;
  onSave: (font: string) => void;
  onClose: () => void;
};

export function SettingsModal({
  isOpen,
  initialFont,
  onSave,
  onClose,
}: SettingsModalProps) {
  const [selectedFont, setSelectedFont] = useState(initialFont);

  useEffect(() => {
    if (isOpen) {
      setSelectedFont(initialFont);
    }
  }, [isOpen, initialFont]);

  const handleSave = useCallback(() => {
    onSave(selectedFont);
  }, [selectedFont, onSave]);

  return (
    <Dialog open={isOpen} onClose={onClose} aria-label="Settings">
      <DialogTitle>Settings</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", justifyContent: "center", py: 0, minHeight: 100 }}>
        <SettingRow label="Font">
          <Select
            id="font-select"
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            sx={{
              minWidth: 240,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.colorDominantBorder },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.colorDominantBorder },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: vars.colorDominantBorder },
            }}
          >
            {FONT_OPTIONS.map((option: FontOption) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  "&.Mui-selected": { backgroundColor: "action.selected" },
                  "&.Mui-selected:hover": { backgroundColor: "action.hover" },
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </SettingRow>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
