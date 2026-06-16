# Backend Model Specification

This document describes the model layer of the Resume Compiler backend (`backend/model`). The model represents a résumé as a tree of `ResumeComponent` objects. Each component knows how to emit its LaTeX and XML representations. The top-level `Resume` class parses raw Markdown into this tree.

## 1. ResumeComponent

1. `ResumeComponent` is an abstract base class that declares abstract methods for the following.
   - Rendering to LaTeX as a list of lines
   - Rendering to XML as an `Element`
2. It also supports serialising the XML element to a string with indentation.

## 2. Resume

1. `Resume` is the root component and the only public entry point for constructing the component tree.
2. Its constructor accepts a Markdown string and runs the parsing pipeline.
3. `Resume` contains a `components` list that holds the top-level children: `Title`, `Subtitle`, `ContactList`, and `ResumeSection` instances.


### 2A. Parsing pipeline

1. The Markdown string is converted to a BeautifulSoup HTML tree using the `markdown` library and `html.parser`.
2. Only `Tag`-typed children of the soup body are retained.
3. Tags prefixed with `^` are stripped:
   - H2 and H3 headings prefixed with `^` have their entire tag group removed.
   - List items (`<li>`) whose text starts with `^` are removed from their parent `<ul>`.
4. Tags before the first H2 are parsed as pre-section components:
   - H1 becomes `Title`.
   - Preformatted block (`<pre>`) becomes `Subtitle`.
   - Unordered list (`<ul>`) becomes `ContactList`.
5. Remaining tags are grouped by H2 boundaries. Each group is dispatched by section type:
   - H2 heading starts with `!` → `ToolsetSection`.
   - Group contains any H3 → `OrganisationalSection`.
   - Otherwise → `CatalogueSection`.


### 2B. LaTeX generation

1. The preamble template is read, the `% FONT CHOICE GOES HERE` placeholder is substituted with the chosen font's LaTeX package command, then each component's LaTeX output is appended inside a `document` environment.


### 2C. XML generation

1. Each child's XML element is collected into a root element and serialised with indentation.


## 3. Title

1. `Title` represents the resume's main heading (typically the candidate's name).
2. Its constructor receives an H1 BeautifulSoup `Tag`.
3. It stores a single `text` attribute containing the inner text of the H1.
4. Its LaTeX output is a centred, bold, `\huge` block.


## 4. Subtitle

1. `Subtitle` represents a secondary line displayed below the title.
2. Its constructor receives a `<pre>` BeautifulSoup `Tag`.
3. It stores a single `text` attribute.
4. Its LaTeX output is a centred, bold block.


## 5. ContactList and ContactListItem

### 5A. ContactList

1. `ContactList` represents a horizontal list of contact details.
2. Its constructor receives a `<ul>` BeautifulSoup `Tag`.
3. It contains a `contacts` list of `ContactListItem` objects, one per `<li>` child.
4. Its LaTeX output renders contacts on a single centred line separated by pipe (`$|$`) characters.


### 5B. ContactListItem

1. `ContactListItem` represents a single contact entry.
2. It stores `displayed_text` (the visible label) and `link` (the URL, or `None` if no hyperlink).
3. If `link` is present, LaTeX output uses `\href{link}{\underline{displayed_text}}`. Otherwise, it outputs `displayed_text`.


## 6. ResumeSection

1. `ResumeSection` is an abstract base class for all section types.
2. It stores a `heading` attribute (the section title).
3. It is subclassed by `CatalogueSection`, `OrganisationalSection`, and `ToolsetSection`.


## 7. CatalogueSection

1. `CatalogueSection` represents a section with no resume items, only a list of labelled entries.
2. It is produced when a section has an H2 but no H3 children.
3. It stores a `catalogue_list` of strings extracted from the `<ul>` children.
4. Items in the list may use a `Label: value` format. The label portion is rendered in bold.
5. Its LaTeX output uses `\section{heading}` followed by an `itemize` environment.


## 8. OrganisationalSection

1. `OrganisationalSection` represents a section whose items have an organisational structure (role, organisation, location, dates).
2. It is produced when a section contains H3 tags.
3. It contains a `resume_items` list of `OrganisationalSectionResumeItem` objects.
4. LaTeX and XML generation delegates to shared utility functions.


## 9. ToolsetSection

1. `ToolsetSection` represents a section whose items have a toolset focus (technologies and dates).
2. It is produced when the H2 heading starts with `!`. The `!` is stripped from the heading text.
3. It contains a `resume_items` list of `ToolsetSectionResumeItem` objects.
4. LaTeX and XML generation delegates to the same utility functions as `OrganisationalSection`.


## 10. ResumeItem

1. `ResumeItem` is an abstract base class for items within organisational and toolset sections.
2. It stores `subheading` (the item title) and `description_list` (a list of bullet-point descriptions).
3. It provides shared helpers for rendering the description list to LaTeX and XML.


## 11. OrganisationalSectionResumeItem

1. `OrganisationalSectionResumeItem` represents an item within an organisational section.
2. Its constructor expects a group of tags: H3 (subheading), `<pre>` (auxiliary info), and `<ul>` (description list).
3. The `<pre>` block provides up to 3 lines mapped to `first_row_right`, `second_row_left`, and `second_row_right` (date, organisation, location).
4. If fewer than 3 lines are provided, missing fields are padded with empty strings.
5. Date ranges are normalised via a shared formatting utility.
6. Its LaTeX output uses the `\resumeItemSubheading` custom command.


## 12. ToolsetSectionResumeItem

1. `ToolsetSectionResumeItem` represents an item within a toolset section.
2. Its constructor expects a group of tags: H3, `<pre>`, and `<ul>`.
3. The `<pre>` block provides up to 2 lines: `tools` (comma-separated technologies) and `time` (date range).
4. If fewer than 2 lines are provided, missing fields are padded with empty strings.
5. Its LaTeX output uses the `\resumeItemSubheadingWithToolset` custom command.


## 13. Shared section utilities

1. `toolset_and_organisational_section_utils.py` contains helper functions used by both `OrganisationalSection` and `ToolsetSection`.
2. It provides tag classification logic for grouping tags into per-item groups.
3. It provides functions for generating LaTeX and XML output for both section types.


## 14. Enums

### 14A. Font

1. The `Font` enum maps each member to a LaTeX `\usepackage` command for the corresponding font package.
2. The available members are:
   - `COMPUTER_MODERN` (empty string, LaTeX default).
   - `TIMES_NEW_ROMAN` (`\usepackage{mathptmx}`).
   - `FIRA_SANS` (`\usepackage[sfdefault]{FiraSans}`).
   - `ROBOTO` (`\usepackage[sfdefault]{roboto}`).
   - `NOTO_SANS` (`\usepackage[sfdefault]{noto-sans}`).
   - `SOURCE_SANS_PRO` (`\usepackage[default]{sourcesanspro}`).
   - `CORMORANT_GARAMOND` (`\usepackage{CormorantGaramond}`).
   - `CHARTER` (`\usepackage{charter}`).
3. A helper maps kebab-case strings (e.g. `"times-new-roman"`) to the corresponding member. It defaults to `TIMES_NEW_ROMAN` for `None` or unrecognised values. This helper is used by the controller layer to resolve the `?font=` query parameter.


## 15. Utilities

1. The `beautiful_soup_utils` utility provides functions for
   - Converting a Markdown string to a BeautifulSoup HTML tree.
   - Filtering a BeautifulSoup element's children to return only `Tag`-typed nodes.
2. The `input_parsing_utils` utility provides functions for truncating or padding lists to a fixed length, with configurable defaults or empty-string fallback.
3. The `latex_utils` utility provides indentation helpers, date-range normalisation (hyphens to LaTeX ` -- `), command construction (e.g. `\textbf{arg}`), and environment wrapping (`\begin{env}...\end{env}`).
4. The `file_utils` utility provides a function that creates parent directories and writes a string to disk. It is used by the compilation service to write the `.tex` file.


## 16. Resources

### 16A. preamble.tex

1. `preamble.tex` is a LaTeX preamble template loaded at compile time.
2. It contains a placeholder `% FONT CHOICE GOES HERE` which is replaced with the `font.value` string from the selected `Font` enum member.
3. The template declares:
   - Document class: `\documentclass[letterpaper, 11pt]{article}`.
   - Packages: `latexsym`, `fullpage`, `titlesec`, `marvosym`, `color`, `verbatim`, `enumitem`, `hyperref`, `fancyhdr`, `babel`, `tabularx`.
   - ATS compliance: `\pdfgentounicode=1`.
   - Page style: `fancy` with empty headers and footers.
   - Margin adjustments: narrower margins suited to a resume layout.
4. It defines the following custom LaTeX commands:
   - `\resumeDescriptionListItem{text}` — a single bullet-point description.
   - `\resumeItemSubheading{org}{date}{title}{loc}` — organisational item subheading in a two-column table.
   - `\resumeSubSubheading{left}{right}` — two-field sub-subheading.
   - `\resumeItemSubheadingWithToolset{left}{right}` — toolset item subheading.
   - `\resumeSubheadingListStart` / `\resumeSubheadingListEnd` — list wrapper for subheadings.
   - `\resumeDescriptionListStart` / `\resumeDescriptionListEnd` — list wrapper for description bullets.
