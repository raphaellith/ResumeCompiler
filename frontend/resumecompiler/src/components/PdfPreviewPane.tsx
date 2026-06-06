export type PdfPreviewPaneProps = {
  pdfUrl: string | null;
  compileError: string | null;
  compiledLabel: string;
};

export function PdfPreviewPane({ pdfUrl, compileError, compiledLabel }: PdfPreviewPaneProps) {
  return (
    <div className="pane">
      <div className="pane-header">PDF Preview</div>
      <div className="pane-body">
        {!pdfUrl ? (
          <div className="empty-preview">
            <h2>Preview is empty</h2>
            <p>Select a Markdown file and click Compile to see the PDF.</p>
          </div>
        ) : (
          <iframe title="Compiled resume preview" className="preview-frame" src={pdfUrl} />
        )}

        {compileError && <div className="compile-error">Failed to compile: {compileError}</div>}
        <div className="preview-footer">{compiledLabel}</div>
      </div>
    </div>
  );
}
