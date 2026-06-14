# Backend Model Specification

This document describes the model layer of the Resume Compiler backend. The model represents a résumé as a tree of `ResumeComponent` objects. Each component knows how to emit its LaTeX representation (via `to_latex_lines()`) and its XML representation (via `to_xml_element()`). The top-level `Resume` class parses raw Markdown into this tree.

## 1. ResumeComponent

1. `ResumeComponent` is an abstract base class defined in `backend/model/resume_components/resume_component.py`.
2. It declares two abstract methods that every concrete component must implement.
3. `to_latex_lines() -> list[str]` returns the component's LaTeX source as a list of lines.
4. `to_xml_element() -> ElementTree.Element` returns the component's XML representation.
5. `to_xml_string() -> str` calls `to_xml_element()` and serialises the result with indentation.

## 2. Resume

1. `Resume` is defined in `backend/model/resume_components/resume.py`. It is the root component and the only public entry point for constructing the component tree.
2. Its constructor accepts a Markdown string and runs the parsing pipeline.
3. `Resume` contains a `components` list that holds the top-level children: `Title`, `Subtitle`, `ContactList`, and `ResumeSection` instances.

### 2A. Parsing pipeline

1. `get_soup_from_markdown(markdown_contents)` converts the Markdown string to a BeautifulSoup HTML tree using the `markdown` library and `html.parser`.
2. `get_children_tags(soup)` extracts only `Tag`-typed children from the soup body.
3. `process_hidden_elements(tags)` scans all tags and strips those prefixed with `^`:
   - H2 and H3 headings prefixed with `^` have their entire tag group removed.
   - List items (`<li>`) whose text starts with `^` are removed from their parent `<ul>`.
4. Tags before the first H2 are parsed as pre-section components:
   - H1 becomes `Title`.
   - Preformatted block (`<pre>`) becomes `Subtitle`.
   - Unordered list (`<ul>`) becomes `ContactList`.
5. Remaining tags are grouped by H2 boundaries. Each group is dispatched by `get_resume_section_from_tags()`:
   - H2 heading starts with `!` → `ToolsetSection`.
   - Group contains any H3 → `OrganisationalSection`.
   - Otherwise → `CatalogueSection`.

### 2B. LaTeX generation

1. `to_latex_lines(font)` reads the preamble template from `preamble.tex`, substitutes the `% FONT CHOICE GOES HERE` placeholder with the chosen font's LaTeX package command, then appends each component's LaTeX output inside a `document` environment.

### 2C. XML generation

1. `to_xml_string()` builds an `ElementTree` by calling `to_xml_element()` on each child and serialises the result.

## 3. Title

1. `Title` is defined in `backend/model/resume_components/title.py`. It represents the resume's main heading (typically the candidate's name).
2. Its constructor receives an H1 BeautifulSoup `Tag`.
3. It stores a single `text` attribute containing the inner text of the H1.
4. Its LaTeX output is a centred, bold, `\huge` block.

## 4. Subtitle

1. `Subtitle` is defined in `backend/model/resume_components/subtitle.py`. It represents a secondary line displayed below the title.
2. Its constructor receives a `<pre>` BeautifulSoup `Tag`.
3. It stores a single `text` attribute.
4. Its LaTeX output is a centred, bold block.

## 5. ContactList and ContactListItem

### 5A. ContactList

1. `ContactList` is defined in `backend/model/resume_components/contact_lists/contact_list.py`. It represents a horizontal list of contact details.
2. Its constructor receives a `<ul>` BeautifulSoup `Tag`.
3. It contains a `contacts` list of `ContactListItem` objects, one per `<li>` child.
4. Its LaTeX output renders contacts on a single centred line separated by pipe (`$|$`) characters.

### 5B. ContactListItem

1. `ContactListItem` is defined in `backend/model/resume_components/contact_lists/contact_list_item.py`. It represents a single contact entry.
2. It stores `displayed_text` (the visible label) and `link` (the URL, or `None` if no hyperlink).
3. If `link` is present, LaTeX output uses `\href{link}{\underline{displayed_text}}`. Otherwise it outputs `displayed_text`.

## 6. ResumeSection

1. `ResumeSection` is an abstract base class in `backend/model/resume_components/resume_sections/resume_section.py`. It is the base for all section types.
2. It stores a `heading` attribute (the section title).
3. It is subclassed by `CatalogueSection`, `OrganisationalSection`, and `ToolsetSection`.

## 7. CatalogueSection

1. `CatalogueSection` is defined in `backend/model/resume_components/resume_sections/catalogue_section.py`. It represents a section with no resume items, only a list of labelled entries.
2. It is produced when a section has an H2 but no H3 children.
3. It stores a `catalogue_list` of strings extracted from the `<ul>` children.
4. Items in the list may use a `Label: value` format. The label portion is rendered in bold.
5. Its LaTeX output uses `\section{heading}` followed by an `itemize` environment.

## 8. OrganisationalSection

1. `OrganisationalSection` is defined in `backend/model/resume_components/resume_sections/organisational_section.py`. It represents a section whose items have an organisational structure (role, organisation, location, dates).
2. It is produced when a section contains H3 tags.
3. It contains a `resume_items` list of `OrganisationalSectionResumeItem` objects.
4. LaTeX and XML generation delegates to shared utility functions in `toolset_and_organisational_section_utils.py`.

## 9. ToolsetSection

1. `ToolsetSection` is defined in `backend/model/resume_components/resume_sections/toolset_section.py`. It represents a section whose items have a toolset focus (technologies and dates).
2. It is produced when the H2 heading starts with `!`. The `!` is stripped from the heading text.
3. It contains a `resume_items` list of `ToolsetSectionResumeItem` objects.
4. LaTeX and XML generation delegates to the same utility functions as `OrganisationalSection`.

## 10. ResumeItem

1. `ResumeItem` is an abstract base class in `backend/model/resume_components/resume_items/resume_item.py`. It is the base for items within organisational and toolset sections.
2. It stores `subheading` (the item title) and `description_list` (a list of bullet-point descriptions).
3. It provides `get_description_list_as_latex_lines()` and `get_description_list_as_xml_element()` as shared helpers.

## 11. OrganisationalSectionResumeItem

1. `OrganisationalSectionResumeItem` is defined in `backend/model/resume_components/resume_items/organisational_section_resume_item.py`.
2. Its constructor expects a group of tags: H3 (subheading), `<pre>` (auxiliary info), and `<ul>` (description list).
3. The `<pre>` block provides up to 3 lines mapped to `first_row_right`, `second_row_left`, and `second_row_right` (date, organisation, location).
4. If fewer than 3 lines are provided, missing fields are padded with empty strings.
5. Date ranges are normalised via `format_date_range()`.
6. Its LaTeX output uses the `\resumeItemSubheading` custom command.

## 12. ToolsetSectionResumeItem

1. `ToolsetSectionResumeItem` is defined in `backend/model/resume_components/resume_items/toolset_section_resume_item.py`.
2. Its constructor expects a group of tags: H3, `<pre>`, and `<ul>`.
3. The `<pre>` block provides up to 2 lines: `tools` (comma-separated technologies) and `time` (date range).
4. If fewer than 2 lines are provided, missing fields are padded with empty strings.
5. Its LaTeX output uses the `\resumeItemSubheadingWithToolset` custom command.

## 13. Shared section utilities

1. `toolset_and_organisational_section_utils.py` (in `backend/model/resume_components/resume_sections/utils/`) contains helper functions used by both `OrganisationalSection` and `ToolsetSection`.
2. It provides `classify_tags_in_toolset_or_organisation_section_by_resume_item()` for grouping tags into per-item tag groups.
3. It provides functions for generating LaTeX and XML output for both section types.

## 14. Enums

### 14A. Font

1. `Font` is defined in `backend/model/enums/font.py`.
2. Each member maps to a LaTeX `\usepackage` command for the corresponding font package.
3. The available members are:
   - `COMPUTER_MODERN` (empty string, LaTeX default).
   - `TIMES_NEW_ROMAN` (`\usepackage{mathptmx}`).
   - `FIRA_SANS` (`\usepackage[sfdefault]{FiraSans}`).
   - `ROBOTO` (`\usepackage[sfdefault]{roboto}`).
   - `NOTO_SANS` (`\usepackage[sfdefault]{noto-sans}`).
   - `SOURCE_SANS_PRO` (`\usepackage[default]{sourcesanspro}`).
   - `CORMORANT_GARAMOND` (`\usepackage{CormorantGaramond}`).
   - `CHARTER` (`\usepackage{charter}`).
4. `from_query_parameter(value: str | None) -> Font` maps kebab-case strings (e.g. `"times-new-roman"`) to the corresponding member. It defaults to `TIMES_NEW_ROMAN` for `None` or unrecognised values.
5. This method is used by the controller layer to resolve the `?font=` query parameter.

## 15. Utilities

### 15A. beautiful_soup_utils

1. `get_soup_from_markdown(markdown_contents)` converts a Markdown string to a BeautifulSoup HTML tree.
2. `get_children_tags(tag)` returns only `Tag`-typed children of a BeautifulSoup element, filtering out `NavigableString` and other non-tag nodes.

### 15B. input_parsing_utils

1. `take_fixed_num_of_inputs_with_defaults(inputs, defaults)` truncates or pads `inputs` to match the length of `defaults`.
2. `take_fixed_num_of_inputs_with_same_default(inputs, n, default)` truncates or pads `inputs` to length `n` using a single default value.
3. `take_fixed_num_of_input_strings(inputs, n)` pads with empty strings.

### 15C. latex_utils

1. `indent_lines(lines)` prepends a tab character to each line.
2. `format_date_range(string)` normalises date-range hyphens to LaTeX ` -- `.
3. `get_latex_command(command, arguments, square_bracket_options)` builds a LaTeX command string such as `\textbf{arg}` or `\command[opt]{arg1}{arg2}`.
4. `get_latex_environment(env, contents, indent_contents)` wraps `contents` in `\begin{env}...\end{env}`.

### 15D. file_utils

1. `create_and_write_file(file_path, contents)` creates parent directories as needed and writes a string to disk. Used by the compilation service to write the `.tex` file.

## 16. Resources

### 16A. preamble.tex

1. `preamble.tex` is located at `backend/model/resources/preamble.tex`.
2. It is a LaTeX preamble template loaded by `Resume.to_latex_lines()`.
3. Line 17 contains the placeholder `% FONT CHOICE GOES HERE`, which is replaced at compile time with the `font.value` string from the selected `Font` enum member.
4. The template declares:
   - Document class: `\documentclass[letterpaper, 11pt]{article}`.
   - Packages: `latexsym`, `fullpage`, `titlesec`, `marvosym`, `color`, `verbatim`, `enumitem`, `hyperref`, `fancyhdr`, `babel`, `tabularx`.
   - ATS compliance: `\pdfgentounicode=1`.
   - Page style: `fancy` with empty headers and footers.
   - Margin adjustments: narrower margins suited to a resume layout.
5. It defines the following custom LaTeX commands:
   - `\resumeDescriptionListItem{text}` — a single bullet-point description.
   - `\resumeItemSubheading{org}{date}{title}{loc}` — organisational item subheading in a two-column table.
   - `\resumeSubSubheading{left}{right}` — two-field sub-subheading.
   - `\resumeItemSubheadingWithToolset{left}{right}` — toolset item subheading.
   - `\resumeSubheadingListStart` / `\resumeSubheadingListEnd` — list wrapper for subheadings.
   - `\resumeDescriptionListStart` / `\resumeDescriptionListEnd` — list wrapper for description bullets.
