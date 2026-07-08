<div align="center">

# Résumé Compiler

<b>From .md to .pdf: Quality LaTeX résumés from everyday Markdown.</b>

[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![LaTeX](https://img.shields.io/badge/LaTeX-00A0A0?logo=latex&logoColor=fff)](https://www.latex-project.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=white)](https://v2.tauri.app/)

[![macOS](https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=white)]()
[![Windows](https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white)]()

</div>

<br>


## Introduction

One of the most popular LaTeX résumé templates available online, [Jake's Resume](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs) provides a clean and professional CV design that is easy to read and visually appealing. However, behind the elegantly simple PDF output is complex LaTeX code that can be difficult to read, maintain and customise.

Résumé Compiler allows you to streamline your CV writing process, leveraging the simplicity of Markdown whilst keeping LaTeX professional formatting.


## Features

- **Markdown Editor:** Write your résumé in readable Markdown. No LaTeX knowledge required.
- **PDF Compilation:** Create and download publication-quality PDFs via LaTeX.
- **Varying Section Layouts:** Choose from three different types of résumé sections: organisational, toolset and catalogue.
- **Hide Elements:** Prefix headings or list items with `^` to omit them from output
- **Font Selection:** Choose from 8 available LaTeX fonts.
  - Times New Roman
  - Computer Modern
  - Roboto
  - Noto Sans
  - Source Sans Pro
  - Fira Sans
  - Cormorant Garamond
  - Charter
- **XML Exports:** Export your résumé as an XML representation of the parsed component tree.
- **Full-Stack Desktop App:** Native browser-based macOS/Windows UI powered by Tauri 2, with an embedded Python backend.


## Download

1. Install a LaTeX distribution that provides `pdflatex` (e.g. [MacTeX](https://tug.org/mactex/) on macOS, [MiKTeX](https://miktex.org/) on Windows).
2. Download prebuilt binaries for macOS and Windows from the [latest release](https://github.com/raphaellith/ResumeCompiler/releases/latest).

> [!IMPORTANT]
> MacOS users may encounter an error claiming that the app is "damaged and can't be opened". This is usually because the application code is [unsigned](https://v2.tauri.app/distribute/sign/macos/), not because it is corrupted. To solve this issue, run
> ```sh
> xattr -c /Applications/resumecompiler.app
> ```
> in Terminal and then reopen the app.


## Syntax Reference

See [`docs/ResumeSyntaxGuide.md`](docs/ResumeSyntaxGuide.md) for the full syntax
reference with examples on how to structure your résumé in Markdown.


## Development

### Run the app from source

1. Ensure you have these prerequisites installed:
   - Python 3.12+
   - Node.js 20+
   - npm
   - Rust toolchain

2. In the repository root, install Python dependencies and start the Tauri dev server:
```sh
pip install -r requirements.txt
cd frontend/resumecompiler
npm install && npm run tauri dev
```

### Web development (browser only)

1. Ensure you have these prerequisites installed:
   - Python 3.12+
   - Node.js 20+
   - npm

2. Start two terminal sessions from the repository root:

```sh
# Terminal 1: backend API server
uvicorn backend.controller.api_controller:app
```

```sh
# Terminal 2: frontend dev server
cd frontend/resumecompiler
npm run dev
```


## Documentation

Refer to the [`docs/`](docs/) directory for detailed design guides and documentation. The repository also includes [`AGENTS.md`](AGENTS.md) with project conventions for AI-assisted development.


## Acknowledgements

- Résumé structure based on
[Jake's Resume](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs)
by Jake Gutierrez.