<div style="text-align: center;">

# Resume Compiler

[![Python 3.12+](https://img.shields.io/badge/python-3.12%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tauri 2](https://img.shields.io/badge/Tauri-2-FFC131?logo=tauri&logoColor=white)](https://v2.tauri.app/)

[![macOS](https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=white)]()
[![Windows](https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white)]()

<img src="frontend/resumecompiler/src-tauri/icons/icon.png" width="100" style="border-radius: 15px;" alt="Resume Compiler icon">

</div>

A desktop app that compiles Markdown into a polished résumé PDF using LaTeX. Built with
[Tauri 2](https://v2.tauri.app/), [React 19](https://react.dev/),
and [FastAPI](https://fastapi.tiangolo.com/). Résumés are based on the
[Jake's Resume](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs) template.

---

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
for the full API reference, available fonts, and error responses.

---

## Syntax Reference

This section describes the Markdown-based syntax used to author a résumé.
The compiler extends standard Markdown with conventions for sections,
resume items, hidden elements, and LaTeX escape sequences.

### Title, Subtitle and Contact List

A résumé begins with a **title** (the candidate's name), an optional
**subtitle**, and an optional **contact list**. These three elements must
appear before the first section heading.

Use an H1 heading for the title:

```markdown
# Jake Ryan
```

Use an indented preformatted block for the subtitle:

```markdown
    A brief subtitle
```

Use an unordered list for the contact list. Items may include hyperlinks
using standard Markdown link syntax.

```markdown
# Jake Ryan
- 123-456-7890
- jake@su.edu
- [resume-compiler.com](https://resume-compiler.com)
```

Only one H1 is permitted — the compiler uses the first one as the title.
Contacts are rendered on a single centred line separated by pipe (`|`).

---

### Sections

Achievements, projects, and skills are grouped into **sections**, each
marked with an H2 heading (e.g. `## Education`, `## Experience`). There
are three types of sections:

- **Organisational** — for roles with an organisation and location
  (jobs, education, etc.)
- **Toolset** — for achievements defined by tools and technologies
  (projects, etc.)
- **Catalogue** — a flat unordered list (technical skills, etc.)

#### Organisational sections

Use an H2 heading to create an organisational section:

```markdown
## Education
```

Each **resume item** within the section is introduced with an H3
**subheading** followed by an indented preformatted block containing
three lines of **auxiliary information**: a date or time range, an
organisation name, and a location.

```markdown
### Undergraduate Research Assistant
    June 2020 – Present
    Texas A&M University
    College Station, TX
```

Then use an unordered list to add a **description list** — bullet points
detailing the achievement:

```markdown
### Undergraduate Research Assistant
    June 2020 – Present
    Texas A&M University
    College Station, TX

- Developed a REST API using Python and Flask
- Presented research findings at the annual symposium
```

The subheading and auxiliary information appear from left to right and
from top to bottom in the compiled PDF:

```text
Undergraduate Research Assistant          June 2020 – Present
Texas A&M University                      College Station, TX

• Developed a REST API using Python and Flask
• Presented research findings at the annual symposium
```

#### Toolset sections

To create a toolset section, prefix the H2 heading with an exclamation
mark (`!`):

```markdown
## !Projects
```

Each resume item uses an H3 subheading followed by an indented
preformatted block with two lines of auxiliary information: a comma-
separated **toolset** (tools and technologies) and a date or time range.

```markdown
### Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 – Present

- Developed a full-stack web application for analysing GitHub repositories
- Containerised the application with Docker and deployed to Google Cloud
```

The subheading and auxiliary information appear from left to right:

```text
Gitlytics | Python, Flask, React, PostgreSQL, Docker     June 2020 – Present

• Developed a full-stack web application...
• Containerised the application with Docker...
```

#### Catalogue sections

A catalogue section contains no H3 subheadings. Use an H2 heading
followed directly by an unordered list:

```markdown
## Technical Skills

- Languages: Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R
- Frameworks: React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI
- Developer Tools: Git, Docker, TravisCI, Google Cloud Platform, VS Code
- Libraries: pandas, NumPy, Matplotlib
```

Each item may optionally begin with a **label** followed by a colon.
Labels (e.g. `Languages`, `Frameworks`) are rendered in bold.

---

### Comments

Plain text that does not belong to a heading, list, or preformatted
block is treated as a comment and ignored. Comments are visible in the
source Markdown but do not appear in the compiled output.

```markdown
This sentence is a comment and will be ignored.

## Education
```

---

### Hiding Elements

Prefix an H2 or H3 heading with a caret (`^`) to hide the entire
section or resume item. All of its content (auxiliary information,
description list) is omitted from the compiled output.

```markdown
## ^Education
```

```markdown
### ^Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 – Present

- Description list item #1
- Description list item #2
```

Prefix a list item with a caret to hide that single item (works for
both description list items and catalogue section items):

```markdown
- ^Description list item #1
- ^Languages: Java, Python, ...
```

---

### Escape Characters and LaTeX Injection

Characters with special meaning in LaTeX must be escaped in Markdown:

| Character | Escape sequence in Markdown |
|:---------:|:--------------------------:|
| `&` | `\&` |
| `%` | `\%` |
| `$` | `\$` |
| `#` | `\#` in code blocks, `\\\#` otherwise |
| `_` | `\_` in code blocks, `\\\_` otherwise |
| `{` | `\{` in code blocks, `\\\{` otherwise |
| `}` | `\}` in code blocks, `\\\}` otherwise |
| `~` | `\textasciitilde` |
| `^` | `\textasciicircum` |
| `\` | `\textbackslash` |

Raw LaTeX code can be injected into the preamble or document body
through preformatted code blocks. Escape sequences should still be
applied to LaTeX special characters as needed.

---

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
