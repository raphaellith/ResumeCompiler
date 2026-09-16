# Backend Model Specification

This document describes the model layer of the Résumé Compiler backend (`backend/model`). The model represents a résumé as a tree of transpilable objects. A `Resume` parses the YAML frontmatter and body of a Markdown file into components, each of which knows how to emit its own LaTeX and XML representation. All model classes derive from `Transpilable`, which declares the `to_latex()` and `to_xml_element()` contracts and provides shared escaping/serialisation helpers.

The model lives under `backend/model`:

- `transpilables/transpilable.py` — abstract base class
- `transpilables/resume.py` — `Resume` root component / parser
- `transpilables/contact.py` — `Contact`
- `transpilables/resume_components/` — `ResumeComponent`, `Heading`, `Achievement` (+ `ThreePartAchievement` / `FourPartAchievement`), `BulletedList`
- `enums/font.py` — `Font`
- `utils/markdown_file_reader.py` — `MarkdownFileReader`
- `resources/template.tex` — LaTeX preamble template


## 1. Transpilable

1. `Transpilable` is the abstract base class for every renderable part of the résumé.

2. It declares two abstract methods:
   - `to_latex() -> str` — the LaTeX representation of the element, and
   - `to_xml_element() -> ElementTree.Element` — the XML representation.

3. It provides `to_xml_string() -> str`, which serialises `to_xml_element()` with two-space indentation.

4. It provides the class method `escape_for_latex(string)`, the single source of LaTeX escaping. Every character in `\ { } $ & # _ ^ ~ %` is replaced with a LaTeX-safe sequence (see `docs/ResumeSyntaxGuide.md` for the mapping).


## 2. Resume

1. `Resume` is the root component and the only public entry point for constructing the component tree. Its constructor accepts the full Markdown file contents (frontmatter + body) and runs the parsing pipeline.

2. It stores the frontmatter fields `title`, `summary`, `contacts`, and the boolean flags `title_bold`, `summary_bold`, `contacts_bold`.

3. It exposes `components`, the list of top-level body components: `Heading`, `Achievement` subclasses, and `BulletedList`.

4. `to_latex(font)` reads the template file, substitutes placeholders `%[[FONT_CHOICE]]%`, `%[[RESUME_TITLE]]%`, `%[[RESUME_SUMMARY]]%`, `%[[RESUME_CONTACT_LIST]]%` and `%[[RESUME_CONTENTS]]%`, and returns the complete LaTeX document.

5. `to_xml_element()` produces a `<resume>` element containing a `<frontmatter>` element followed by elements for body components. The `<frontmatter>` element contains sub-elements `<title>`, `<summary>` and `<contacts>` with `bold` attributes, where `<contacts>` contains a collection of `<contact>` elements. Body elements include `<heading>`, `<three-part-achievement>`, `<four-part-achievement>` and `<bulleted-list>`.


### 2A. Parsing pipeline

1. `MarkdownFileReader` parses the YAML frontmatter via the `frontmatter` library and converts the body to a BeautifulSoup HTML tree via `python-markdown` and the `html.parser` parser.

2. Frontmatter is validated to have `title`, `summary` and `contacts`. Contacts must be a list of dicts, each with a string `display` and an optional string `link`. Contact-related validation is performed in `Resume._validate_and_parse_contacts`.

3. `_validate_tags()` checks the body structure. The top-level tags, concatenated in document order, must fully match `(<h1>|<ul>|<h2><pre>|<p>)*`. Also, headings must contain exactly one plain text node; `<ul>` children are `<li>` tags containing only `<b>`/`<i>` tags; a `<pre>` wraps exactly one `<code>` whose single text node spans exactly 2 or 3 lines.

4. `_remove_hidden_tags()` strips hidden elements:
   - An H1 or H2 heading prefixed with `^` has its entire section scope removed.
   - List items (`<li>`) whose text starts with `^` are removed from their parent `<ul>`, which itself is dropped if it becomes empty.

5. `_get_tags_grouped_by_component()` groups the remaining tags into components: `h1`, `h2`, and `ul` start a new component, while a `pre` extends the immediately preceding one.

6. Each group becomes a component: `h1` → `Heading`; `h2` (with its `pre`) → `Achievement`; `ul` → `BulletedList`. A top-level `<p>` is ignored (treated as a comment).


### 2B. Template file resolution

1. `Resume.get_latex_template_file_path()` locates `backend/model/resources/template.tex`.

2. The resolution strategy differs between dev and frozen (PyInstaller) runs:
   - Dev (unfrozen): the backend must be run from the repository root, so the path is resolved against the current working directory.
   - Frozen (onefile sidecar): modules live inside the bundled PYZ archive and are not extracted to disk, so the path resolves against `sys._MEIPASS` — where the `--add-data` bundle places `backend/model/resources/template.tex`.


## 3. Contact

1. `Contact` represents a single contact entry with `display` (string) and optional `link` (string or `None`).

2. `to_latex()` escapes both fields. With a link it emits `\href{display}{\underline{link}}`; without one it emits only the escaped display text.

3. `to_xml_element()` produces a `<contact>` element whose text is the display string, with a `link` attribute when a link is present.


## 4. ResumeComponent

1. `ResumeComponent` is an abstract base class for body components, deriving from `Transpilable`.

2. It is subclassed by `Heading` and `BulletedList`.


## 5. Heading

1. `Heading` wraps an H1 `BeautifulSoup.Tag` and stores its text.

2. `to_latex()` emits `\section{<escaped text>}`.

3. `to_xml_element()` produces a `<heading>` element containing the heading text.


## 6. Achievement

1. `Achievement` is an abstract base class for the two structured entries, deriving directly from `Transpilable`.

2. It stores `parts`, a tuple of three or four strings: the H2 heading text followed by the stripped lines of the code block.

3. The factory `Achievement.from_tags(tags)` extracts an H2 tag and its `<pre>` tag and returns:
   - a `ThreePartAchievement` when the code block spans 2 lines; or
   - a `FourPartAchievement` when it spans 3 lines.
   It raises `ValueError` for any other part count.

4. Shared helpers build LaTeX commands (`\threePartAchievement{...}{...}{...}` / `\fourPartAchievement{...}{...}{...}{...}`, each argument escaped) and XML containers (`<three-part-achievement>` / `<four-part-achievement>` with one `<part>` element per part).


### 6A. ThreePartAchievement

1. Represents a three-part achievement.

2. Rendered as a single-row table. The first part is displayed in bold on its left side. If the second part is non-empty, it is italicised and displayed after the first part with a `|` separator. The third part is displayed on the right side of the table.


### 6B. FourPartAchievement

1. Represents a four-part achievement.

2. Rendered as a two-row table. The first part is displayed in bold in the top-left corner. The second line is displayed in the top right. The third and fourth part are italicised on the left and right sides of the bottom row respectively.


## 7. BulletedList

1. `BulletedList` wraps a `<ul>` tag and stores its `<li>` children.

2. `to_latex()` renders an `itemize` environment. Each list item is converted recursively: text nodes are LaTeX-escaped, `<b>` becomes `\textbf{...}`, `<i>` becomes `\textit{...}`; any other tag raises `ValueError`.

3. `to_xml_element()` produces a `<bulleted-list>` element with one `<list-item>` per item, preserving `<b>`/`<i>` children.


## 8. Font

1. `Font` is a `str`-valued enum. Each member's value is its display name:
   - `COMPUTER_MODERN` = `"Computer Modern"`
   - `TIMES_NEW_ROMAN` = `"Times New Roman"`
   - `FIRA_SANS` = `"Fira Sans"`
   - `ROBOTO` = `"Roboto"`
   - `NOTO_SANS` = `"Noto Sans"`
   - `SOURCE_SANS_PRO` = `"Source Sans Pro"`
   - `CORMORANT_GARAMOND` = `"Cormorant Garamond"`
   - `CHARTER` = `"Charter"`

2. The `get_latex_import` property maps each member to its LaTeX `\usepackage` command, which is substituted into the template's `%[[FONT_CHOICE]]%` slot.

3. The `as_query_parameter` property lower-cases the value and joins words with hyphens (e.g. `"Times New Roman"` → `"times-new-roman"`).

4. `from_query_parameter(query_parameter)` resolves a kebab-case query string back to its enum member, defaulting to `TIMES_NEW_ROMAN` for `None` or unrecognised values.

5. `get_default_font()` returns `TIMES_NEW_ROMAN`, the canonical default.


## 9. MarkdownFileReader

1. `MarkdownFileReader` parses raw file contents into YAML frontmatter and a Markdown body.

2. Its frontmatter getters, including `get_string_argument_from_frontmatter`, `get_boolean_argument_from_frontmatter` and `get_list_argument_from_frontmatter`, extract typed values and raise `KeyError` (missing) or `TypeError` (wrong type).

3. `get_soup_from_body()` converts the body with `python-markdown` and parses it into a BeautifulSoup tree.

4. `get_tags_from_body()` returns the tree's top-level `Tag` children.


## 10. Resources

### 10A. template.tex

1. `template.tex` is the LaTeX preamble and document skeleton loaded at compile time. It declares `\documentclass[letterpaper, 10pt]{article}` and imports `latexsym`, `fullpage`, `titlesec`, `marvosym`, `color`, `verbatim`, `enumitem`, `hyperref`, `fancyhdr`, `babel`, `tabularx`, and `etoolbox`, plus `\input{glyphtounicode}`.

2. It sets the page style to `fancy`, narrows the margins, forces ragged-right layout, and enables ATS-compliance via `\pdfgentounicode=1`.

3. Its five placeholders, `%[[FONT_CHOICE]]%`, `%[[RESUME_TITLE]]%`, `%[[RESUME_SUMMARY]]%`, `%[[RESUME_CONTACT_LIST]]%` and  `%[[RESUME_CONTENTS]]%`, are substituted by `Resume.to_latex`.

4. It defines the custom commands used by the components:
   - `\resumeTitle{text}` — centred `\huge` title.
   - `\resumeSummary{text}` — centred summary line.
   - `\resumeContactList{...}` — centred contact row.
   - `\threePartAchievement{title}{tools}{date}` — single-row item, see `ThreePartAchievement`.
   - `\fourPartAchievement{title}{org}{role}{date}` — two-row item, see `FourPartAchievement`.
