import { useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { type FontOption } from "../../config/font";
import { SettingRow } from "../SettingRow/SettingRow";
import vars from "../../styles/variables.module.scss";

export type SettingsModalProps = {
  isOpen: boolean;
  initialFontQueryParam: string;
  onSave: (fontQueryParam: string) => void;
  onClose: () => void;
  fontOptions: FontOption[];
  fontsLoading: boolean;
  fontError: string | null;
};

export function SettingsModal({
  isOpen,
  initialFontQueryParam,
  onSave,
  onClose,
  fontOptions,
  fontsLoading,
  fontError,
}: SettingsModalProps) {
  const [selectedFontQueryParam, setSelectedFontQueryParam] = useState(initialFontQueryParam);

  useEffect(() => {
    if (isOpen) {
      setSelectedFontQueryParam(initialFontQueryParam);
    }
  }, [isOpen, initialFontQueryParam]);

  const handleSave = useCallback(() => {
    onSave(selectedFontQueryParam);
  }, [selectedFontQueryParam, onSave]);

  const isDisabled = fontsLoading || fontError !== null;

  const renderFontOptions = () => {
    if (fontsLoading) {
      return (
        <MenuItem disabled value="">
          Loading fonts...
        </MenuItem>
      );
    }
    if (fontError) {
      return (
        <MenuItem disabled value="">
          {fontError}
        </MenuItem>
      );
    }
    return fontOptions.map((option: FontOption) => {
      const queryParam = option.asQueryParam();
      return (
        <MenuItem
          key={queryParam}
          value={queryParam}
          sx={{
            "&.Mui-selected": { backgroundColor: "action.selected" },
            "&.Mui-selected:hover": { backgroundColor: "action.hover" },
          }}
        >
          {option.name}
        </MenuItem>
      );
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} aria-label="Settings">
      <DialogTitle>Settings</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", justifyContent: "center", py: 0, minHeight: 100 }}>
        <SettingRow label="Font">
          <Select
            id="font-select"
            value={selectedFontQueryParam}
            onChange={e => setSelectedFontQueryParam(e.target.value)}
            disabled={isDisabled}
            sx={{
              minWidth: 240,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.colorDominantBorder },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.colorDominantBorder },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: vars.colorDominantBorder },
            }}
          >
            {renderFontOptions()}
          </Select>
        </SettingRow>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={isDisabled}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
