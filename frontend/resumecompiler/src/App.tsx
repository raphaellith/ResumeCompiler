import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

import { isTauri } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { MarkdownEditorPane } from "./components/MarkdownEditorPane";
import { PdfPreviewPane } from "./components/PdfPreviewPane";
import { ResizableHandle } from "./components/ResizableHandle";
import { Toolbar } from "./components/Toolbar";
import { COMPILED_PDF_ENDPOINT } from "./config/api";
import { useMarkdownDocument } from "./hooks/useMarkdownDocument";
import { usePdfCompilation } from "./hooks/usePdfCompilation";
import { useSaveMarkdownOnClose } from "./hooks/useSaveMarkdownOnClose";
import { stripExtension } from "./utils/path";

const HANDLE_WIDTH = 12;
const PANE_PADDING = 12;
const MIN_PANE_WIDTH = 200;

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

  const { pdfUrl, pdfBlob, isCompiling, compileError, compilePdf } =
    usePdfCompilation(COMPILED_PDF_ENDPOINT);

  useSaveMarkdownOnClose({
    filePath,
    markdown,
  });

  const [leftPaneWidth, setLeftPaneWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || leftPaneWidth !== null) return;
    const contentWidth =
      containerRef.current.getBoundingClientRect().width - 2 * PANE_PADDING;
    setLeftPaneWidth((contentWidth - HANDLE_WIDTH) / 2);
  });

  const handleDrag = useCallback((deltaX: number) => {
    if (!containerRef.current) return;
    const contentWidth =
      containerRef.current.getBoundingClientRect().width - 2 * PANE_PADDING;
    const available = contentWidth - HANDLE_WIDTH;
    setLeftPaneWidth((prev) => {
      const current = prev ?? available / 2;
      return Math.min(
        Math.max(current + deltaX, MIN_PANE_WIDTH),
        available - MIN_PANE_WIDTH,
      );
    });
  }, []);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFile = useCallback(async () => {
    const result = await openFilePicker();
    if (result) {
      compilePdf(result.markdown);
    } else if (!isTauri()) {
      fileInputRef.current?.click();
    }
  }, [openFilePicker, compilePdf]);

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await loadFile(file);
      compilePdf(result.markdown);
      e.target.value = "";
    },
    [loadFile, compilePdf]
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
    const baseName = stripExtension(fileDisplayName) || "resume";
    const fileName = `${baseName}.pdf`;

    if (isTauri()) {
      void (async () => {
        const filePath = await save({
          defaultPath: fileName,
          filters: [{ name: "PDF", extensions: ["pdf"] }],
        });
        if (!filePath) return;
        const arrayBuffer = await pdfBlob.arrayBuffer();
        await writeFile(filePath, new Uint8Array(arrayBuffer));
      })();
    } else {
      const exportUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = exportUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(exportUrl);
    }
  }, [fileDisplayName, pdfBlob]);

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

      <section className="panes" ref={containerRef}>
        <div
          className="pane-wrapper"
          style={leftPaneWidth != null ? { flex: `0 0 ${leftPaneWidth}px` } : { flex: 1 }}
        >
          <MarkdownEditorPane
            fileName={fileDisplayName}
            hasFile={hasFile}
            markdown={markdown}
            onMarkdownChange={updateMarkdown}
          />
        </div>

        <ResizableHandle onDrag={handleDrag} />

        <div className="pane-wrapper" style={{ flex: 1 }}>
          <PdfPreviewPane
            pdfUrl={pdfUrl}
            compileError={compileError}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
