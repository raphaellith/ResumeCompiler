import Button from "@mui/material/Button";

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function SettingsButton({ onClick, disabled = false }: SettingsButtonProps) {
  return (
    <Button onClick={onClick} aria-label="Settings" disabled={disabled}>
      <span className="material-symbols-outlined">settings</span>
    </Button>
  );
}