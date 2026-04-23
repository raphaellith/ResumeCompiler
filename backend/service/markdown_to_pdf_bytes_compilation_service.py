from pathlib import Path
import subprocess
import tempfile

from backend.model.resume_components.resume import Resume
from backend.model.enums.font import Font


def get_pdf_bytes_from_markdown(markdown: str, font: Font = Font.TIMES_NEW_ROMAN) -> bytes:
    """
    Converts Markdown code to a resume PDF and returns its bytes.
    :param markdown: The Markdown code to be converted to PDF.
    :param font: The Font object to be used to convert the Markdown code to PDF.
    """
    resume = Resume(markdown)
    latex_code = _get_latex_code_from_resume(resume, font)
    pdf_bytes = _get_pdf_bytes_from_latex_code(latex_code)
    return pdf_bytes

def _get_latex_code_from_resume(resume: Resume, font: Font = Font.TIMES_NEW_ROMAN) -> str:
    """
    Returns the LaTeX representation of the resume.
    :param resume: The Resume object to be converted to LaTeX.
    :param font: The Font to be used in the resume.
    """
    latex_lines: list[str] = resume.to_latex_lines(font)
    latex_result: str = "\n".join(latex_lines)
    return latex_result

def _get_pdf_bytes_from_latex_code(latex_code: str) -> bytes:
    """
    Compiles LaTeX source code into PDF bytes.
    Uses an isolated temporary directory so build artifacts are not persisted on disk.
    """
    with tempfile.TemporaryDirectory(prefix="resume_compiler_") as temporary_directory:
        temporary_directory_path = Path(temporary_directory)
        latex_file_path = temporary_directory_path / "resume.tex"
        pdf_output_path = temporary_directory_path / "resume.pdf"

        latex_file_path.write_text(latex_code, encoding="utf-8")

        stdout, stderr, return_code = _run_pdflatex(latex_file_path.name, temporary_directory_path)
        if return_code != 0:
            raise RuntimeError(f"LaTeX compilation failed.\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}")

        if not pdf_output_path.exists():
            raise RuntimeError("LaTeX compilation finished but did not produce a PDF output file.")

        return pdf_output_path.read_bytes()

def _run_pdflatex(latex_file_name: str, working_directory: Path) -> tuple[str, str, int]:
    """
    Runs pdflatex on the specified LaTeX file in the given working directory, and returns the stdout, stderr and return
    code outputted by the process.
    :param latex_file_name: The name of the LaTeX file.
    :param working_directory: The path to the working directory where the LaTeX file is located.
    """
    try:
        process = subprocess.run(
            [
                'pdflatex',
                '-interaction=nonstopmode',  # Do not pause for user input when errors occur
                '-halt-on-error',
                latex_file_name
            ],
            stdout=subprocess.PIPE,    # Capture standard output
            stderr=subprocess.PIPE,    # Capture standard error
            stdin=subprocess.DEVNULL,  # Disable standard input
            text=True,                 # Output as text (not bytes)
            cwd=working_directory.as_posix(),
            check=False,               # Do not raise exception on non-zero exit
        )
    except FileNotFoundError as error:
        raise RuntimeError("Could not find 'pdflatex'. Install a LaTeX distribution on the backend host.") from error

    return process.stdout, process.stderr, process.returncode


if __name__ == '__main__':
    print(_get_pdf_bytes_from_latex_code(r"\documentclass{article}\begin{document}Hi\end{document}"))