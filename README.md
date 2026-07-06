<div align="center">

# Resume Compiler

<b>From .md to .pdf: Quality LaTeX résumés from everyday Markdown.</b>

[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=white)](https://v2.tauri.app/)

[![macOS](https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=white)]()
[![Windows](https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white)]()

</div>

<br>

## Quick Start

### Desktop app

```sh
pip install -r requirements.txt
cd frontend/resumecompiler
npm install && npm run tauri dev
```

### Web development

Two terminals from the repo root:

```sh
# Terminal 1 — backend API server
uvicorn backend.controller.api_controller:app
```

```sh
# Terminal 2 — frontend dev server
cd frontend/resumecompiler
npm run dev
```

### Headless API

The backend exposes `POST /pdf/` and `POST /xml/` endpoints directly.
See [`docs/backend/BackendControllerSpecification.md`](docs/backend/BackendControllerSpecification.md)
for the full API reference.


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

| Prefix on | Effect |
|-----------|--------|
| `## ` | Hides entire section |
| `### ` | Hides that resume item |
| `- ` | Hides that list item |


## Development

Refer to the [`docs/`](docs/) directory for detailed design documents:

- **Backend** — controller, model, and service specifications
- **Frontend** — functional specification and style guide
- **Release & CI/CD** — build pipeline, sidecar architecture, and
  GitHub Actions workflow

The repository also includes [`AGENTS.md`](AGENTS.md) with project
conventions for AI-assisted development.

## Acknowledgements

- Résumé structure based on
[Jake's Resume](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs)
by Jake Gutierrez.
