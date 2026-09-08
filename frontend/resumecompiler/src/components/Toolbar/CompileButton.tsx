import Button from "@mui/material/Button";

export type CompileButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

export function CompileButton({ disabled, onClick }: CompileButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled}>
      Compile
    </Button>
  );
}