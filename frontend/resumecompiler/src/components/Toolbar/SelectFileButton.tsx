import Button from "@mui/material/Button";
import styles from "./Toolbar.module.scss";

export type SelectFileButtonProps = {
  onClick: () => void;
};

export function SelectFileButton({ onClick }: SelectFileButtonProps) {
  return (
    <div className={styles.actions}>
      <Button variant="contained" onClick={onClick}>
        Select File
      </Button>
    </div>
  );
}