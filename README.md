<div align="center">

# Résumé Compiler

<b>From .md to .pdf: Quality LaTeX résumés from everyday Markdown.</b>

[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
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

Check out the [latest release](https://github.com/raphaellith/ResumeCompiler/releases/) for prebuilt binaries for macOS and Windows.

Required dependencies:
- **LaTeX distribution** providing `pdflatex` (e.g. [MacTeX](https://tug.org/mactex/) on macOS, [MiKTeX](https://miktex.org/) on Windows)


## Syntax Reference

See [`docs/ResumeSyntaxGuide.md`](docs/ResumeSyntaxGuide.md) for the full
specification. Below is a quick overview.

### Header

```markdown
# Jake Ryan                          ← H1 (required, first only)
    A brief subtitle                 ← indented block (optional)
- 123-456-7890                       ← unordered list (optional)
- jake@su.edu
```

Contacts rendered on one line separated by `|`.

### Sections (`## …`)

| Type | Marker | Items | Auxiliary info |
|------|--------|-------|----------------|
| Organisational | (none) | H3 + description list | date, org, location (3 lines) |
| Toolset | `!` prefix | H3 + description list | tools, date (2 lines) |
| Catalogue | (none) | flat list | — |

**Organisational** — roles with an org and location:
```markdown
## Experience

### Undergraduate Research Assistant
    June 2020 – Present
    Texas A&M University
    College Station, TX

- Developed a REST API using Python and Flask
```
Rendered as:
```text
Undergraduate Research Assistant          June 2020 – Present
Texas A&M University                      College Station, TX
• Developed a REST API using Python and Flask
```

**Toolset** — achievements defined by tools/technologies:
```markdown
## !Projects

### Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 – Present

- Developed a full-stack web application
```
Rendered as:
```text
Gitlytics | Python, Flask, React, PostgreSQL, Docker     June 2020 – Present
• Developed a full-stack web application
```

**Catalogue** — flat list, optional `Label:` prefix rendered in bold:
```markdown
## Technical Skills

- Languages: Java, Python, C/C++
- Frameworks: React, Node.js, Flask
```

### Comments

Text outside headings, lists, and preformatted blocks is ignored.

### Hiding Elements

Prefix with `^` to omit from output:

| Prefix on | Effect                 |
|-----------|------------------------|
| `## `     | Hides entire section   |
| `### `    | Hides that resume item |
| `- `      | Hides that list item   |


## Development

### Run the app from source

Prerequisites: **Python 3.12+**, **Node.js 20+** & **npm**, **Rust toolchain**.

```sh
pip install -r requirements.txt
cd frontend/resumecompiler
npm install && npm run tauri dev
```

### Web development (browser only)

Prerequisites: **Python 3.12+**, **Node.js 20+** & **npm**.

Start two terminal sessions from the repository root:

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
