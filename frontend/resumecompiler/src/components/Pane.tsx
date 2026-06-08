import { memo, type HTMLAttributes, type ReactNode } from "react";

export type PaneProps = {
  title: string;
  titleEnd?: string;
  children: ReactNode;
  bodyProps?: HTMLAttributes<HTMLDivElement>;
};

function PaneBase({ title, titleEnd, children, bodyProps }: PaneProps) {
  const { className, ...restBodyProps } = bodyProps ?? {};

  return (
    <div className="pane">
      <div className="pane-header">
        <span>{title}</span>
        {titleEnd && <span className="pane-header-end">{titleEnd}</span>}
      </div>
      <div className={`pane-body${className ? ` ${className}` : ""}`} {...restBodyProps}>
        {children}
      </div>
    </div>
  );
}

export const Pane = memo(PaneBase);



