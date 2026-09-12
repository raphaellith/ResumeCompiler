import { useCallback, useEffect, useState } from "react";
import { ApiClient } from "../config/apiClient.ts";

export type PdfCompilationState = {
  pdfUrl: string | null;
  pdfBlob: Blob | null;
  isCompiling: boolean;
  lastCompiledAt: Date | null;
  compileError: string | null;
};

export type UsePdfCompilationResult = PdfCompilationState & {
  compilePdf: (source: string, fontQueryParam?: string) => Promise<void>;
};

export function usePdfCompilation(): UsePdfCompilationResult {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastCompiledAt, setLastCompiledAt] = useState<Date | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  const compilePdf = useCallback(
    async (markdown: string, fontQueryParam?: string) => {
      setIsCompiling(true);
      setCompileError(null);

      try {
        const response = await ApiClient.getResponseFromPostRequestToPdfEndpoint(markdown, fontQueryParam);

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
    []
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
