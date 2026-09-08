import CircularProgress from "@mui/material/CircularProgress";
import styles from "./Toolbar.module.scss";

export type BackendStatusThrobberProps = {
  backendReady: boolean;
};

export function BackendStatusThrobber({ backendReady }: BackendStatusThrobberProps) {
  if (backendReady) {
    return null;
  }

  return (
    <span className={styles.throbber}>
      <CircularProgress enableTrackSlot size={20} thickness={5} color="primary" />
    </span>
  );
}