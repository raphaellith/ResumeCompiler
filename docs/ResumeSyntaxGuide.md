# Resume Syntax Guide

This document describes the Markdown-style syntax used to author a résumé that the Résumé Compiler can parse and compile into a PDF. A source résumé is a single Markdown file made of two parts: a YAML frontmatter block (title, summary and contacts) and a Markdown body (sections, achievements and bulleted lists). See `files/base-template.md` for a complete working example.

The parser is strict: the document body must match a fixed structure, and any deviation raises a validation error rather than being silently ignored. A summary of the permitted top-level elements:

| Markdown                                                   | Parsed element                                          |
|------------------------------------------------------------|---------------------------------------------------------|
| `---` YAML frontmatter block                               | `title`, `summary`, `contacts` + bold flags             |
| `# Section Heading` (H1)                                   | `Heading` (a `\section` in the PDF)                     |
| `## …` (H2) immediately followed by an indented code block | `Achievement` (2-line `threePart` or 3-line `fourPart`) |
| `- item` (top-level `<ul>`)                                | `BulletedList`                                          |
| Plain paragraph (`<p>`)                                    | Comment, ignored                                        |

Nothing else is allowed at the top level: H3/H4 headings, horizontal rules, blockquotes, tables, images, and non-`<b>`/`<i>` inline tags are rejected.


## 1. Frontmatter

The document must begin with a YAML frontmatter block delimited by `---` lines. The compiler reads its frontmatter through the `frontmatter` library (`backend.model.utils.markdown_file_reader`), which also strips the block from the Markdown body before parsing.

The supported fields are:

- `title` (required, string) — the candidate's name, rendered prominently at the top of the résumé.
- `summary` (required, string) — the professional summary, rendered under the title.
- `contacts` (required, list of `{display, link?}`) — contact details rendered on a single centred line separated by `|` characters. Each entry must have a `display` string; `link` is optional. When `link` is present, the contact is rendered as a hyperlink.
- `title_bold` (optional, boolean) — renders the title in bold.
- `summary_bold` (optional, boolean) — renders the summary in bold.
- `contacts_bold` (optional, boolean) — renders the entire contact list in bold.

A contact link is validated only for type (string); no URL format check is performed. Missing required fields raise a `KeyError`; wrong types raise a `TypeError`, both surfaced as HTTP 500 responses.

Frontmatter values are raw text: LaTeX special characters are escaped automatically by the compiler (see [section 6](#6-special-characters-and-escaping)). For example, write `summary: Accenture & Analysts` with a plain `&`, not `\&`.

```yaml
---
title: Tsz Him (Raphael) Li

summary: Software engineer specialising in high-performance systems.

contacts:
  - display: +44 (0)7445327586
  - display: raphaellith@gmail.com
  - display: github.com/raphaellith
    link: https://github.com/raphaellith

title_bold: true
summary_bold: true
contacts_bold: false
---
```


## 2. Sections

Use an H1 heading (`#`) to create a new section (e.g. `# Education`, `# Projects`, `# Work Experience`). Each H1 starts a new section whose title is rendered as a section heading with an underline rule in the compiled PDF. An H1 must contain exactly one plain text node and no nested tags. There is no separate "title" heading in the body — the document title comes exclusively from frontmatter.

Multiple H1 headings are permitted and documents with no H1 still compile — the leading group simply renders its contents without a section heading.


## 3. Achievements

An achievement is a single structured entry, driven by how many lines its code block spans. Write an H2 heading followed immediately by an indented (4 spaces) code block:

```markdown
## University College London (UCL)
    London, UK
    BSc in Computer Science — 87.75% average
    Sep 2024 - Jun 2027 (expected)
```

The H2 text becomes the item's bold title. Each indented line becomes one of the remaining parts:

- **3-line block → `fourPartAchievement`.** The three lines render right-top (organisation or location), then as an italic pair left-bottom (role or award) and right-bottom (date range). Example above.
- **2-line block → `threePartAchievement`.** The two lines map to (left) a comma-separated list of tools or technologies, rendered italicised after a `|` separator, and (right) the date range.

```markdown
## Manuscripta with IBM
    ASP.NET Core, C#, Java, React
    Oct 2025 - Present
```

Every H2 must be immediately followed by its code block; an H2 with 2 or 3 code lines only. Any other line count is a validation error. A bulleted list (`- items`) directly under an H2 (i.e. before the next H1/H2) is still valid: it is rendered as a sibling item under the same section heading, visually appearing as description bullets for the preceding achievement. See `files/base-template.md` for the combined pattern.


## 4. Bulleted lists

A top-level unordered list (`-` items) is rendered as a bullet list. This is how you add:

- description bullets under an achievement;
- list sections such as `# Technical Skills`, where each item is a `Label: value` pair (e.g. `- Languages: Java, Python`). The label is not automatically bolded — use `<b>` (section 4A) to emphasise it.

```markdown
- Languages: Java, Python
- Web & Networking: HTML, CSS, React
```

### 4A. Inline emphasis

Inline emphasis inside list items must use **raw HTML**: `<b>…</b>` for bold and `<i>…</i>` for italics. Markdown's `**bold**` and `*italic*` produce `<strong>` and `<em>` respectively, which the parser explicitly rejects — only `<b>` and `<i>` are allowed inside `<li>` elements. Nested emphasis (e.g. `<b><i>…</i></b>`) is supported.


## 5. Hiding elements

Prefix a heading with a caret (`^`) to hide the whole section or item:

1. `^` prefix on an H1 or H2 hides that heading and everything after it until the next H1 or H2 (the heading's "section scope").
2. `^` prefix on a list item (`- ^text`) hides that single item, in both description lists and list sections.

Hidden elements are dropped before parsing, so they must still be valid Markdown (e.g. a hidden H2 still needs its code block).


## 6. Special characters and escaping

The compiler escapes LaTeX special characters **automatically** after Markdown parsing. Do **not** backslash-escape them in the source Markdown — a literal `\&` in the source becomes a literal backslash-and-ampersand in the PDF. Simply write the character as-is, in frontmatter, headings, list items, and code blocks alike.

The following mapping is applied to parsed text (`Transpilable.escape_for_latex`):

| Source character | LaTeX output |
|:---:|:---:|
| `\` | `\textbackslash` |
| `{` | `\{` |
| `}` | `\}` |
| `$` | `\$` |
| `&` | `\&` |
| `#` | `\#` |
| `_` | `\_` |
| `^` | `\^{}` |
| `~` | `\~{}` |
| `%` | `\%` |

One caveat for body text (headings and list items): Markdown itself consumes backslash escapes for its own special characters (`#`, `_`, `{`, `}`, `[`, `]`, `<`, `>`, backslash, backtick). A `\#` in a list item is therefore stripped by Markdown to `#` and then escaped to `\#` by the compiler — the rendered PDF still shows `#`. Characters such as `&`, `%`, `$`, `^` and `~` are not Markdown-special and pass through untouched.


## 7. Comments

Plain paragraphs that are not headings, lists or code blocks are treated as comments and ignored. They are useful as source notes (e.g. between sections) but never appear in the compiled output.


## 8. Validation errors

The parser validates the body (`backend/model/transpilables/resume.py`). Rules that produce an error (reported as HTTP 500 via the generic exception handler):

- top-level tags are not a repetition of `h1`, `ul`, `p`, or `h2` immediately followed by its code block;
- a heading contains anything other than a single plain text node;
- a `<ul>` contains a non-`<li>` child, or an `<li>` contains a tag other than `<b>`/`<i>`;
- a code block is missing, contains nested tags, or spans fewer than 2 or more than 3 lines;
- a required frontmatter field is missing (`KeyError`) or has the wrong type (`TypeError`).