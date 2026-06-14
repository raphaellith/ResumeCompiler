# Backend Service Specification

This document describes the service layer of the Resume Compiler backend. Services orchestrate the compilation pipeline by bridging the controller layer and the model layer. Two services exist: one for PDF compilation and one for XML compilation.

## 1. PDF compilation service

1. The PDF compilation service is defined in `backend/service/markdown_to_pdf_bytes_compilation_service.py`.
2. Its public entry point is `get_pdf_bytes_from_markdown(markdown: str, font: Font = Font.TIMES_NEW_ROMAN) -> bytes`.
3. This function orchestrates the full Markdown-to-PDF pipeline.

### 1A. Compilation pipeline

1. A `Resume` object is constructed from the input Markdown string. This triggers the full parsing pipeline: Markdown to BeautifulSoup, tag extraction, hidden element stripping, section type detection, and component tree construction.
2. `_get_latex_code_from_resume(resume, font)` calls `resume.to_latex_lines(font)` and joins the resulting lines into a single LaTeX string.
3. `_get_pdf_bytes_from_latex_code(latex_code)` writes the LaTeX string to a temporary directory, runs `pdflatex`, and reads back the resulting PDF bytes.

### 1B. pdflatex invocation

1. `_run_pdflatex(latex_file_name, working_directory)` shells out to `pdflatex` using `subprocess.run`.
2. Flags used: `-interaction=nonstopmode` (no interactive prompts) and `-halt-on-error` (abort immediately on error).
3. Standard input is set to `DEVNULL` to prevent hanging on interactive prompts.
4. The LaTeX file is written and compiled inside a `tempfile.TemporaryDirectory` that is automatically cleaned up after the PDF bytes are read.

### 1C. Error handling

1. If `pdflatex` is not found on `$PATH`, a `FileNotFoundError` is caught and re-raised as `RuntimeError("Could not find 'pdflatex'...")`.
2. If `pdflatex` exits with a non-zero return code, a `RuntimeError` is raised containing the captured stdout and stderr.
3. If the output `resume.pdf` does not exist after compilation, a `RuntimeError` is raised.

## 2. XML compilation service

1. The XML compilation service is defined in `backend/service/markdown_to_xml_string_compilation_service.py`.
2. Its public entry point is `get_resume_as_xml_from_markdown(markdown: str) -> str`.
3. This function constructs a `Resume` object and calls `resume.to_xml_string()`.
4. No LaTeX or PDF step is involved. No font parameter is accepted. No filesystem I/O is performed.

## 3. Service–model boundary

1. Services import only the `Resume` class and the `Font` enum from the model layer.
2. All parsing logic, LaTeX generation, and XML generation is handled by the model.
3. Services are thin orchestrators that handle I/O (subprocess, filesystem) and wire the pipeline steps together.
