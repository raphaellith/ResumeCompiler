# Resume Compiler Frontend

A Tauri + React UI for editing Markdown resumes and previewing mock-compiled PDFs.

## Features

- Split editor and PDF preview panes with drag-and-drop Markdown upload.
- Recompile and export actions for PDF output.
- Auto-save of changes back to the original Markdown file on window close.

## Quick Start

```bash
npm install
npm run dev
```

## Tauri Desktop

```bash
npm run tauri dev
```

## Mock PDF Script

Generate a PDF from a Markdown file without running the UI:

```bash
npm run mock:pdf -- path/to/resume.md output.pdf
```
