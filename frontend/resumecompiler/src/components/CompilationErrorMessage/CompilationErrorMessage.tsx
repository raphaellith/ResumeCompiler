import { useEffect, useState } from "react";
import styles from "./CompilationErrorMessage.module.scss";

export type CompilationErrorMessageProps = {
  message: string | null;
};

type OsType = "macos" | "windows" | "linux" | "unknown";

function getOs(): OsType {
  if (typeof navigator === "undefined") return "unknown";
  const platform = navigator.platform?.toLowerCase() || "";
  const userAgent = navigator.userAgent?.toLowerCase() || "";
  if (platform.includes("mac") || userAgent.includes("mac")) return "macos";
  if (platform.includes("win") || userAgent.includes("win")) return "windows";
  if (platform.includes("linux") || userAgent.includes("linux")) return "linux";
  return "unknown";
}

const INSTALL_INSTRUCTIONS: Record<OsType, { title: string; steps: string[] }> = {
  macos: {
    title: "Install MacTeX (macOS)",
    steps: [
      "Option A: brew install --cask mactex",
      "Option B: Download from https://tug.org/mactex/",
    ],
  },
  windows: {
    title: "Install MiKTeX (Windows)",
    steps: [
      "Option A: winget install MiKTeX.MiKTeX",
      "Option B: Download from https://miktex.org/",
    ],
  },
  linux: {
    title: "Install TeX Live (Linux)",
    steps: [
      "Ubuntu/Debian: sudo apt install texlive-latex-base texlive-latex-extra",
      "Fedora: sudo dnf install texlive-scheme-basic",
      "Arch: sudo pacman -S texlive-core",
    ],
  },
  unknown: {
    title: "Install a LaTeX distribution",
    steps: [
      "macOS: https://tug.org/mactex/",
      "Windows: https://miktex.org/",
      "Linux: sudo apt install texlive-latex-base texlive-latex-extra",
    ],
  },
};

export function CompilationErrorMessage({ message }: CompilationErrorMessageProps) {
  const [os, setOs] = useState<OsType>("unknown");

  useEffect(() => {
    setOs(getOs());
  }, []);

  if (!message) {
    return null;
  }

  const isLatexNotFound = message === "LATEX_NOT_FOUND";

  if (isLatexNotFound) {
    const instructions = INSTALL_INSTRUCTIONS[os];
    return (
      <div className={styles["latex-missing"]}>
        <strong>LaTeX is required to compile PDFs</strong>
        <p>
          <strong>{instructions.title}</strong>
        </p>
        <ul>
          {instructions.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      </div>
    );
  }

  return <div className={styles["compile-error"]}>Failed to compile: {message}</div>;
}
