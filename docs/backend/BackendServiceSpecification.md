# Backend Service Specification

This document describes the service layer of the Resume Compiler backend (`backend/service`). Services orchestrate the compilation pipeline by bridging the controller layer and the model layer. Two services exist: one for PDF compilation and one for XML compilation.

Services import only the `Resume` class and the `Font` enum from the model layer. All parsing and compilation logic is handled by the model.


## 1. PDF compilation service

1. The PDF compilation service accepts a Markdown string and an optional font parameter, and returns the corresponding PDF bytes.


## 1A. Workflow

1. Initialise a `Resume` object with the input Markdown string. This triggers the full parsing pipeline: Markdown to BeautifulSoup, tag extraction, hidden element stripping, section type detection, and component tree construction.
2. Use the `Resume` object to produce LaTeX lines, and join them into a single LaTeX string.
3. Writes the LaTeX string to a file in a temporary directory (`tempfile.TemporaryDirectory`).
4. Use `subprocess.run` to invoke `pdflatex` on the LaTeX file for compilation. Pass the LaTeX file path and working directory as arguments. Use the flags `-interaction=nonstopmode` (no interactive prompts) and `-halt-on-error` (abort immediately on error). Set standard input to `DEVNULL` to prevent hanging on interactive prompts.
5. The PDF bytes compiled by `pdflatex` are read from the output file (`resume.pdf`) in the temporary directory and returned as the service response. The temporary directory and its contents (LaTeX source, PDF output, etc.) are automatically deleted to remove any residual files after compilation.


### 1B. Error handling

1. If `pdflatex` is not found on `$PATH`, a `FileNotFoundError` is caught and re-raised as `RuntimeError("Could not find 'pdflatex'...")`.
2. If `pdflatex` exits with a non-zero return code, a `RuntimeError` is raised containing the captured stdout and stderr.
3. If the output `resume.pdf` does not exist after compilation, a `RuntimeError` is raised.


## 2. XML compilation service

1. The XML compilation service accepts a Markdown string and returns its serialised XML string representation.
