import styles from "./CompilationErrorMessage.module.scss";

export type CompilationErrorMessageProps = {
  message: string | null;
};

export function CompilationErrorMessage({ message }: CompilationErrorMessageProps) {
  if (!message) {
    return null;
  }

  return <div className={styles["compile-error"]}>Failed to compile: {message}</div>;
}
