import { Pane } from "../Pane/Pane";
import { CompilationErrorMessage } from "../CompilationErrorMessage/CompilationErrorMessage";
import styles from "./PdfPreviewPane.module.scss";

export type PdfPreviewPaneProps = {
  pdfUrl: string | null;
  compileError: string | null;
};

export function PdfPreviewPane({ pdfUrl, compileError }: PdfPreviewPaneProps) {
  return (
    <Pane title="PDF Preview">
      {!pdfUrl ? (
        <div className={styles["empty-preview"]}>
          <h3>No preview available</h3>
          <p>Select a Markdown file for compilation.</p>
        </div>
      ) : (
        <iframe title="Compiled resume preview" className={styles["preview-frame"]} src={pdfUrl} />
      )}

      <CompilationErrorMessage message={compileError} />
    </Pane>
  );
}
