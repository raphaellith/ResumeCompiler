import Button from "@mui/material/Button";

export type SettingsButtonProps = {
  onClick: () => void;
};

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <Button onClick={onClick} aria-label="Settings">
      <span className="material-symbols-outlined">settings</span>
    </Button>
  );
}