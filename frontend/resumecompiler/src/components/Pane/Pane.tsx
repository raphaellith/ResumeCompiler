import { memo, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Pane.module.scss";

export type PaneProps = {
  title: string;
  titleEnd?: string;
  children: ReactNode;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
};

function PaneBase({ title, titleEnd, children, bodyProps }: PaneProps) {
  const { className, ...restBodyProps } = bodyProps ?? {};

  return (
    <div className={styles.pane}>
      <div className={styles["pane-header"]}>
        <span>{title}</span>
        {titleEnd && <span className={styles["pane-header-end"]}>{titleEnd}</span>}
      </div>
      <div className={`${styles["pane-body"]}${className ? ` ${className}` : ""}`} {...restBodyProps}>
        {children}
      </div>
    </div>
  );
}

export const Pane = memo(PaneBase);
