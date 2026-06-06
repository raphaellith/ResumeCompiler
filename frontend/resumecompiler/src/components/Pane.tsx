import { memo, type HTMLAttributes, type ReactNode } from "react";

export type PaneProps = {
  title: string;
  children: ReactNode;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
};

function PaneBase({ title, children, bodyProps }: PaneProps) {
  const { className, ...restBodyProps } = bodyProps ?? {};

  return (
    <div className="pane">
      <div className="pane-header">{title}</div>
      <div className={`pane-body${className ? ` ${className}` : ""}`} {...restBodyProps}>
        {children}
      </div>
    </div>
  );
}

export const Pane = memo(PaneBase);



