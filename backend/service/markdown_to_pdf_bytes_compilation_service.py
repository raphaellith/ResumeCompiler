import glob
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from backend.model.transpilables.resume import Resume
from backend.model.enums.font import Font
from backend.service.errors.pdf_latex_not_found_error import PdfLatexNotFoundError


def get_pdf_bytes_from_markdown(markdown: str, font: Font = Font.TIMES_NEW_ROMAN) -> bytes:
    """
    Converts Markdown code to a resume PDF and returns its bytes.
    :param markdown: The Markdown code to be converted to PDF.
    :param font: The Font object to be used to convert the Markdown code to PDF.
    """
    resume = Resume(markdown)
    latex = resume.to_latex(font)
    pdf_bytes = _get_pdf_bytes_from_latex(latex)
    return pdf_bytes


def _get_pdf_bytes_from_latex(latex_code: str) -> bytes:
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


def _locate_pdflatex() -> str:
    """
    Resolves the path to a usable `pdflatex` executable or raises PdfLatexNotFoundError.

    When launching the desktop app via LaunchServices (e.g. through Finder or Dock), its environment does not apply the
    macOS `path_helper` entries (`/etc/paths` and `/etc/paths.d/*`). Therefore, unlike in interactive shells, the
    sidecar's inherited `$PATH` does not contain LaTeX install locations.

    We therefore adopt this resolution order.

    1. `$PATH` lookup: This covers dev mode and terminal-spawned backends.
    2. `/etc/paths` and `/etc/paths.d/*` directories: This matches how a system LaTeX distribution registers itself.
    3. Known install roots on Darwin (e.g. MacTeX, TeX Live and MacPorts).
    """
    path_found = shutil.which("pdflatex")
    if path_found:
        return path_found

    path_helper_entries = _macos_path_helper_entries()
    if path_helper_entries:
        augmented_path = os.pathsep.join([*path_helper_entries, os.environ.get("PATH", "")])
        path_found = shutil.which("pdflatex", path=augmented_path)
        if path_found:
            return path_found

    if os.name == "posix" and os.uname().sysname == "Darwin":
        candidates = [
            "/Library/TeX/texbin/pdflatex",
            "/Library/TeX/Distributions/Programs/texbin/pdflatex",
            "/opt/local/bin/pdflatex",
            *glob.glob("/usr/local/texlive/*/bin/*/pdflatex"),
        ]
        for candidate in candidates:
            if os.path.isfile(candidate) and os.access(candidate, os.X_OK):
                return candidate

    raise PdfLatexNotFoundError()


def _macos_path_helper_entries() -> list[str]:
    """
    Returns the directories referenced by /etc/paths and /etc/paths.d/*, the files which
    `/usr/libexec/path_helper` merges into `$PATH` for login shells. Only present on macOS.
    """
    entries: list[str] = []

    for path in glob.glob("/etc/paths") + glob.glob("/etc/paths.d/*"):
        if not os.path.isfile(path):
            continue

        try:
            with open(path, encoding="utf-8") as file:
                entries.extend(line.strip() for line in file if line.strip() and not line.startswith("#"))
        except OSError:
            continue

    return entries


def _run_pdflatex(latex_file_name: str, working_directory: Path) -> tuple[str, str, int]:
    """
    Runs pdflatex on the specified LaTeX file in the given working directory, and returns the stdout, stderr and return
    code outputted by the process.
    :param latex_file_name: The name of the LaTeX file.
    :param working_directory: The path to the working directory where the LaTeX file is located.
    """
    pdflatex_path = _locate_pdflatex()
    try:
        process = subprocess.run(
            [
                pdflatex_path,
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
        raise PdfLatexNotFoundError() from error
    except OSError as error:
        if "not found" in str(error).lower() or "no such file" in str(error).lower():
            raise PdfLatexNotFoundError() from error
        raise

    return process.stdout, process.stderr, process.returncode
