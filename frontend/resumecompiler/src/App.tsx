import { useCallback } from "react";
import "./App.css";

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
  } = useMarkdownDocument();

  const { pdfUrl, pdfBlob, isCompiling, lastCompiledAt, compileError, compilePdf } =
    usePdfCompilation(COMPILE_ENDPOINT);

  useSaveMarkdownOnClose({
    filePath,
    markdown,
  });

  const handleSelectFile = useCallback(
    async (file: File) => {
      await loadFile(file);
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
        onSelectFile={handleSelectFile}
        onCompile={handleCompile}
        onExport={handleExport}
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
