# Backend Service Specification

This document describes the service layer of the Résumé Compiler backend (`backend/service`). Services orchestrate the pipeline by bridging the controller layer and the model layer. Three services exist: PDF compilation, XML compilation, and font-name listing.

All parsing and compilation logic must be handled by the model.


## 1. PDF compilation service

1. `get_pdf_bytes_from_markdown(markdown, font=Font.TIMES_NEW_ROMAN)` accepts a Markdown string and an optional `Font` and returns the corresponding PDF bytes.


### 1A. Workflow

1. Initialise a `Resume` object with the input Markdown string. This triggers the full parsing pipeline: frontmatter extraction, Markdown-to-BeautifulSoup conversion, tag extraction, hidden-element stripping, structure validation and component tree construction.

2. Call `resume.to_latex(font)` to produce the complete LaTeX document filled with font, title, summary, contacts and contents.

3. Write the LaTeX string to `resume.tex` inside a `tempfile.TemporaryDirectory(prefix="resume_compiler_")`.

4. Run `pdflatex` via `subprocess.run` with the flags `-interaction=nonstopmode` (no interactive prompts) and `-halt-on-error` (abort immediately on error). Standard input is set to `DEVNULL` and stdout/stderr are captured, with the working directory set to the temporary directory.

5. If the exit code is non-zero, raise a `RuntimeError` containing the captured stdout and stderr.

6. If the `resume.pdf` output file does not exist, raise a `RuntimeError`.

7. Otherwise read `resume.pdf` and return its bytes. The temporary directory and its contents are automatically deleted on exit.


### 1B. Error handling

1. If `pdflatex` is not found on `$PATH` (or spawn fails with a "not found"/"no such file" `OSError`), a `PdfLatexNotFoundError` is raised (`backend/service/errors/pdf_latex_not_found_error.py`, a `RuntimeError` subclass whose message is `"Could not find 'pdflatex'. Install a LaTeX distribution on the backend host."`). The controller surfaces it as an HTTP 500 with `error: "PdfLatexNotFoundError"`.

2. A non-zero `pdflatex` exit code raises `RuntimeError` with the captured stdout and stderr.

3. A missing `resume.pdf` after compilation raises `RuntimeError`.


## 2. XML compilation service

File: `backend/service/markdown_to_xml_string_compilation_service.py`

1. `get_resume_as_xml_from_markdown(markdown)` accepts a Markdown string and returns its serialised XML string.

2. It runs the same parsing pipeline as the PDF service but performs no LaTeX compilation.


## 3. Font-name list service

File: `backend/service/font_name_list_service.py`

1. `get_valid_font_names()` returns the display names of every `Font` enum member (in declaration order). This powers the `GET /font-names` endpoint's `names` field, keeping the frontend's font selector in sync with the backend enum.

2. `get_default_font_name()` returns the default font (`Times New Roman`).
