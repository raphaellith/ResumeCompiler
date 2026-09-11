import React, { useCallback, useEffect, useRef, useState } from "react";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { isTauri } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { MarkdownEditorPane } from "./components/MarkdownEditorPane/MarkdownEditorPane";
import { PdfPreviewPane } from "./components/PdfPreviewPane/PdfPreviewPane";
import { ResizableHandle } from "./components/ResizableHandle/ResizableHandle";
import { SettingsModal } from "./components/SettingsModal/SettingsModal";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { getCompiledPdfEndpoint, getCompiledXmlEndpoint } from "./config/api";
import { fetchFontOptions, fetchDefaultFontOption, type FontOption } from "./config/font";
import { useMarkdownDocument } from "./hooks/useMarkdownDocument";
import { usePdfCompilation } from "./hooks/usePdfCompilation";
import { useSaveMarkdownOnClose } from "./hooks/useSaveMarkdownOnClose";
import { useXmlExport } from "./hooks/useXmlExport";
import vars from "./styles/variables.module.scss";
import styles from "./App.module.scss";

const HANDLE_WIDTH = 12;
const PANE_PADDING = 12;
const MIN_PANE_WIDTH = 200;

const theme = createTheme({
  typography: {
    fontFamily: vars.fontFamily,
  },
  palette: {
    primary: {
      main: vars.colorAccent,
      contrastText: vars.colorAccentDark,
    },
    secondary: {
      main: vars.colorDominant,
      contrastText: vars.colorSecondary,
    },
    background: {
      default: vars.colorDominant,
      paper: vars.colorDominantLight,
    },
    text: {
      primary: vars.colorSecondary,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 14px",
          lineHeight: 1.75,
          minWidth: 0,
          "&.Mui-disabled": {
            opacity: 0.6,
          },
        },
        contained: {
          border: `1px solid ${vars.colorDominantBorder}`,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
          "&.Mui-disabled": {
            border: `1px solid ${vars.colorDominantBorder}`,
            boxShadow: "none",
            backgroundColor: vars.colorAccent,
            color: vars.colorAccentDark,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${vars.colorDominantBorder}`,
          borderRadius: 12,
          backgroundImage: "none",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          background: vars.colorDominant,
          fontWeight: 700,
          padding: "14px 18px",
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "18px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "0 18px 14px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: vars.colorDominant,
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: vars.colorDominantBorder,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: vars.colorAccent,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: vars.colorAccent,
          },
        },
        input: {
          color: vars.colorSecondary,
          fontWeight: 600,
          padding: "8px 10px",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: vars.colorSecondary,
          fontWeight: 600,
          "&.Mui-focused": {
            color: vars.colorAccent,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: vars.colorDominantLight,
          border: `1px solid ${vars.colorDominantBorder}`,
          borderRadius: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: vars.colorSecondary,
          fontWeight: 600,
          "&:hover": {
            background: `color-mix(in srgb, ${vars.colorDominant} 50%, ${vars.colorDominantLight} 50%)`,
          },
          "&.Mui-disabled": {
            opacity: 0.6,
          },
          "&.Mui-focusVisible": {
            outline: 0,
          },
          "&.Mui-selected": {
            border: "none",
            outline: 0,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: vars.colorSecondary,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

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
    usePdfCompilation(getCompiledPdfEndpoint);

  const { exportXml } =
    useXmlExport(getCompiledXmlEndpoint);

  useSaveMarkdownOnClose({
    filePath,
    markdown,
  });

  const [fontQueryParam, setFontQueryParam] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [fontOptions, setFontOptions] = useState<FontOption[]>([]);
  const [fontError, setFontError] = useState<string | null>(null);
  const [fontsLoading, setFontsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await getCompiledPdfEndpoint();
        setBackendReady(true);

        const [options, defaultOpt] = await Promise.all([
          fetchFontOptions(),
          fetchDefaultFontOption(),
        ]);
        setFontOptions(options);
        setFontQueryParam(defaultOpt.asQueryParam());
      } catch (error) {
        console.error("Backend init failed:", error);
        setBackendReady(false);
        setFontError(
          error instanceof Error
            ? `Backend unavailable: ${error.message}`
            : "Backend unavailable. Ensure the Tauri sidecar has started."
        );
      } finally {
        setFontsLoading(false);
      }
    };
    init();
  }, []);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleSaveFont = useCallback((nextFontQueryParam: string) => {
    setFontQueryParam(nextFontQueryParam);
    setIsSettingsOpen(false);
  }, []);

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
      await compilePdf(result.markdown, fontQueryParam);
    } else if (!isTauri()) {
      fileInputRef.current?.click();
    }
  }, [openFilePicker, compilePdf, fontQueryParam]);

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const result = await loadFile(file);
      await compilePdf(result.markdown, fontQueryParam);
      e.target.value = "";
    },
    [loadFile, compilePdf, fontQueryParam]
  );

  const handleCompile = useCallback(() => {
    if (!hasFile) {
      return;
    }
    void compilePdf(markdown, fontQueryParam);
  }, [compilePdf, hasFile, markdown, fontQueryParam]);

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

  const handleExportXml = useCallback(() => {
    const baseName = stripExtension(fileDisplayName) || "resume";
    const fileName = `${baseName}.xml`;

    void exportXml(markdown).then((xmlText) => {
      if (isTauri()) {
        void (async () => {
          const filePath = await save({
            defaultPath: fileName,
            filters: [{ name: "XML", extensions: ["xml"] }],
          });
          if (!filePath) return;
          const encoder = new TextEncoder();
          await writeFile(filePath, encoder.encode(xmlText));
        })();
      } else {
        const blob = new Blob([xmlText], { type: "application/xml" });
        const exportUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = exportUrl;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(exportUrl);
      }
    });
  }, [fileDisplayName, markdown, exportXml]);

  return (
    <ThemeProvider theme={theme}>
      <main className={styles.app}>
        <Toolbar
          hasFile={hasFile}
          isCompiling={isCompiling}
          canExport={Boolean(pdfBlob)}
          canExportXml={Boolean(pdfBlob)}
          onOpenFile={handleOpenFile}
          onCompile={handleCompile}
          onSettings={handleOpenSettings}
          onExport={handleExport}
          onExportXml={handleExportXml}
          backendReady={backendReady}
          fontsLoading={fontsLoading}
          fontError={fontError}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          initialFontQueryParam={fontQueryParam}
          onSave={handleSaveFont}
          onClose={handleCloseSettings}
          fontOptions={fontOptions}
          fontsLoading={fontsLoading}
          fontError={fontError}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,text/markdown"
          onChange={handleFileInputChange}
          style={{ display: "none" }}
        />

        <section className={styles.panes} ref={containerRef}>
          <div
            className={styles["pane-wrapper"]}
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

          <div className={styles["pane-wrapper"]} style={{ flex: 1 }}>
            <PdfPreviewPane
              pdfUrl={pdfUrl}
              compileError={compileError}
            />
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}

export default App;
