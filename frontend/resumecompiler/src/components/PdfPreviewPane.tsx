import { CompilationErrorMessage } from "./CompilationErrorMessage";

export type PdfPreviewPaneProps = {
  pdfUrl: string | null;
  compileError: string | null;
};

export function PdfPreviewPane({ pdfUrl, compileError }: PdfPreviewPaneProps) {
  return (
    <div className="pane">
      <div className="pane-header">PDF Preview</div>
      <div className="pane-body">
        {!pdfUrl ? (
          <div className="empty-preview">
            <h3>No preview available</h3>
            <p>Select a Markdown file for compilation.</p>
          </div>
        ) : (
          <iframe title="Compiled resume preview" className="preview-frame" src={pdfUrl} />
        )}

        <CompilationErrorMessage message={compileError} />
      </div>
    </div>
  );
}
