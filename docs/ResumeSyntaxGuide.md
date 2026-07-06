# Resume Syntax Guide

This guide walks you through the Markdown syntax the Résumé Compiler uses
to turn your résumé into a polished PDF. The syntax builds on everyday
Markdown, adding a few conventions for sections, contact info, hiding
elements and working with LaTeX special characters.

---


## 1. Title, subtitle and contacts

Everything starts with your name (required), an optional subtitle and
optional contact details. These must appear before your first section
heading.

```markdown
# Jake Ryan                          ← H1 (required, first only)
    A brief subtitle                 ← indented block (optional)
- 123-456-7890                       ← unordered list (optional)
- jake@su.edu
```

- **H1 heading** (`#`) — your name. Only one H1 per résumé; the first
  one is used as the title.
- **Indented line** — a subtitle that sits right below your name.
- **Unordered list** (`-` items) — contact details such as phone,
  email or website. They are rendered on a single centred line
  separated by `|`. You can use Markdown links like
  `[label](url)` inside list items.

---


## 2. Section types

There are three kinds of sections, each with its own layout. Pick the
one that fits best.

| Type | Marker | Items | Auxiliary info |
|------|--------|-------|----------------|
| Organisational | (none) | H3 + description list | date, org, location (3 lines) |
| Toolset | `!` prefix | H3 + description list | tools, date (2 lines) |
| Catalogue | (none) | flat list | — |


### Organisational

Use this for roles where you want to show an organisation name and
location alongside the date.

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

The H2 heading (`##`) creates the section. Each role gets an H3
(`###`). Right after the H3, an indented block provides three lines:
date, organisation and location. The description list below it holds your bullet-point achievements.


### Toolset

Toolset sections highlight the tools and technologies you used, with
the organisation name left out.

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

Prefix the H2 heading with `!` (e.g. `## !Projects`). The auxiliary
block still goes right after the H3, but now it has only two lines:
a comma-separated list of tools, then the date. Description lists work
the same way as in organisational sections.


### Catalogue

Catalogue sections are flat lists — no subheadings, no auxiliary
blocks.

```markdown
## Technical Skills

- Languages: Java, Python, C/C++
- Frameworks: React, Node.js, Flask
```

Just an H2 heading followed directly by an unordered list. If an item
starts with a label followed by a colon (e.g. `Languages:`), that label
is rendered in bold.

---


## 3. Hiding elements

Prefix any heading or list item with `^` to keep it out of the
compiled PDF.

| Prefix on | Effect |
|-----------|--------|
| `## ` | Hides the entire section |
| `### ` | Hides that one resume item |
| `- ` | Hides that single list item |

---


## 4. Comments

Any text that is not a heading, a list item or inside an indented
block is treated as a comment and ignored. You can use comments to
leave notes to yourself in the source without affecting the output.

---


## 5. Escape characters and LaTeX injection

### Special characters

These characters have special meaning in LaTeX and need to be escaped
in your Markdown:

| Character | Escape sequence in Markdown |
|:---------:|:---------------------------:|
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


### LaTeX injection

You can inject raw LaTeX into the preamble or document body using
preformatted code blocks. Just remember to escape any LaTeX special
characters as needed.
