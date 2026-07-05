import { useCallback, useEffect, useState } from "react";

export type PdfCompilationState = {
  pdfUrl: string | null;
  pdfBlob: Blob | null;
  isCompiling: boolean;
  lastCompiledAt: Date | null;
  compileError: string | null;
};

export type UsePdfCompilationResult = PdfCompilationState & {
  compilePdf: (source: string, font?: string) => Promise<void>;
};

export function usePdfCompilation(
  getCompileEndpoint: () => Promise<string>
): UsePdfCompilationResult {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastCompiledAt, setLastCompiledAt] = useState<Date | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  const compilePdf = useCallback(
    async (source: string, font?: string) => {
      setIsCompiling(true);
      setCompileError(null);

      const baseEndpoint = await getCompileEndpoint();
      const url = font
        ? `${baseEndpoint}?font=${encodeURIComponent(font)}`
        : baseEndpoint;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/pdf",
          },
          body: JSON.stringify({ markdown: source }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          if (errorBody?.error === "pdflatex_not_found") {
            throw new Error("LATEX_NOT_FOUND");
          }
          const errorText = errorBody?.message || `Backend returned ${response.status}.`;
          throw new Error(errorText);
        }

        const nextBlob = await response.blob();
        const nextUrl = URL.createObjectURL(nextBlob);

        setPdfBlob(nextBlob);
        setPdfUrl((currentUrl) => {
          if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
          }
          return nextUrl;
        });

        setLastCompiledAt(new Date());
      } catch (error) {
        console.error("Failed to compile PDF.", error);
        setCompileError(error instanceof Error ? error.message : "Failed to compile PDF.");
      } finally {
        setIsCompiling(false);
      }
    },
    [getCompileEndpoint]
  );

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  return {
    pdfUrl,
    pdfBlob,
    isCompiling,
    lastCompiledAt,
    compileError,
    compilePdf,
  };
}
