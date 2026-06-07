import { useCallback, useRef } from "react";
import "./App.css";

import { isTauri } from "@tauri-apps/api/core";
import { MarkdownEditorPane } from "./components/MarkdownEditorPane";
import { PdfPreviewPane } from "./components/PdfPreviewPane";
import { Toolbar } from "./components/Toolbar";
import { COMPILE_ENDPOINT } from "./config/api";
import { useMarkdownDocument } from "./hooks/useMarkdownDocument";
import { usePdfCompilation } from "./hooks/usePdfCompilation";
import { useSaveMarkdownOnClose } from "./hooks/useSaveMarkdownOnClose";
import { stripExtension } from "./utils/path";

function App() {
  const {
    markdown,
    filePath,
    fileDisplayName,
    hasFile,
    updateMarkdown,
    loadFile,
    openFilePicker,
  } = useMarkdownDocument();

  const { pdfUrl, pdfBlob, isCompiling, lastCompiledAt, compileError, compilePdf } =
    usePdfCompilation(COMPILE_ENDPOINT);

  useSaveMarkdownOnClose({
    filePath,
    markdown,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFile = useCallback(async () => {
    const result = await openFilePicker();
    if (!result && !isTauri()) {
      fileInputRef.current?.click();
    }
  }, [openFilePicker]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      void loadFile(file);
      e.target.value = "";
    },
    [loadFile]
  );

  const handleCompile = useCallback(() => {
    if (!hasFile) {
      return;
    }
    void compilePdf(markdown);
  }, [compilePdf, hasFile, markdown]);

  const handleExport = useCallback(() => {
    if (!pdfBlob) {
      return;
    }
    const exportUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    const baseName = stripExtension(fileDisplayName);
    link.href = exportUrl;
    link.download = `${baseName || "resume"}.pdf`;
    link.click();
    URL.revokeObjectURL(exportUrl);
  }, [fileDisplayName, pdfBlob]);

  const compiledLabel = lastCompiledAt
    ? `Compiled at ${lastCompiledAt.toLocaleTimeString()}`
    : "Not compiled yet";

  return (
    <main className="app">
      <Toolbar
        hasFile={hasFile}
        isCompiling={isCompiling}
        canExport={Boolean(pdfBlob)}
        onOpenFile={handleOpenFile}
        onCompile={handleCompile}
        onExport={handleExport}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,text/markdown"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      <section className="panes">
        <MarkdownEditorPane
          hasFile={hasFile}
          markdown={markdown}
          onMarkdownChange={updateMarkdown}
        />

        <PdfPreviewPane
          pdfUrl={pdfUrl}
          compileError={compileError}
          compiledLabel={compiledLabel}
        />
      </section>
    </main>
  );
}

export default App;
