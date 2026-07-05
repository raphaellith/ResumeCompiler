class PdfLatexNotFoundError(RuntimeError):
    def __init__(self):
        super().__init__("Could not find 'pdflatex'. Install a LaTeX distribution on the backend host.")
