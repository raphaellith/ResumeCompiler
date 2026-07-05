import { useCallback, useRef } from "react";
import styles from "./ResizableHandle.module.scss";

export type ResizableHandleProps = {
  onDrag: (deltaX: number) => void;
};

export function ResizableHandle({ onDrag }: ResizableHandleProps) {
  const dragging = useRef(false);
  const startX = useRef(0);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;

      let overlay = overlayRef.current;
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.style.cssText =
          "position:fixed;inset:0;z-index:9999;cursor:col-resize;";
        document.body.appendChild(overlay);
        overlayRef.current = overlay;
      }

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = ev.clientX - startX.current;
        startX.current = ev.clientX;
        onDrag(delta);
      };

      const handleMouseUp = () => {
        dragging.current = false;
        overlay.removeEventListener("mousemove", handleMouseMove);
        overlay.removeEventListener("mouseup", handleMouseUp);
        overlay.remove();
        overlayRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      overlay.addEventListener("mousemove", handleMouseMove);
      overlay.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [onDrag],
  );

  return (
    <div
      className={styles["resizable-handle"]}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
    />
  );
}
