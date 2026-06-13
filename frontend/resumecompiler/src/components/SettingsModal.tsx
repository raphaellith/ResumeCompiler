import { useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { FONT_OPTIONS, type FontOption } from "../config/font";

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
      <DialogContent>
        <FormControl fullWidth variant="outlined" sx={{ mt: 3, minWidth: 240 }}>
          <InputLabel id="font-select-label" sx={{ "&.Mui-focused": { color: "text.primary" } }}>
            Font
          </InputLabel>
          <Select
            labelId="font-select-label"
            id="font-select"
            value={selectedFont}
            label="Font"
            onChange={(e) => setSelectedFont(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "text.primary" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "text.primary" },
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
        </FormControl>
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
