# Resume Syntax Guide

This document describes the Markdown-style syntax used to author a résumé that the Resume Compiler can parse and compile into a PDF. The syntax extends standard Markdown with conventions for sections, resume items, hiding elements and LaTeX escape sequences.


## 1. Title, subtitle and contact list

1. The title, subtitle (optional), and contact list (optional) must appear before the first section heading.


### 1A. Title

1. Use an H1 heading (`#`) to define the title. The title typically contains the candidate's first and last name.
2. Only one H1 element is permitted. The compiler uses the first H1 as the title.


### 1B. Subtitle

1. Use an indented line to define a subtitle.
2. The subtitle appears below the title as a secondary description.


### 1C. Contact list

1. Use an unordered list (`-` items) after the title to define a contact list.
2. Each list item represents one contact detail (phone number, email address, website, etc.).
3. Items may be formatted as hyperlinks using standard Markdown link syntax: `[label](url)`.
4. Contacts are rendered on a single centred line separated by pipe (`|`) characters.


## 2. Organisational sections

### 2A. Section heading

1. Use an H2 heading (`##`) to create a new organisational section.
2. The heading text becomes a section title in the compiled document.


### 2B. Resume item heading

1. Use an H3 heading (`###`) for each resume item within the section.
2. The H3 text becomes the subheading of the item (typically a role title such as "Undergraduate Research Assistant").


### 2C. Auxiliary information

1. After an H3, add an indented preformatted block (4 spaces) containing 3 lines of auxiliary information:  a date or time range (e.g. "June 2020 -- Present"), an organisation name and a location.
2. These fields are laid out from left to right and top to bottom in the compiled PDF.


### 2D. Description list

1. After the auxiliary block, use an unordered list to create a description list for the item.
2. Each list item is one bullet-point description of the achievement or responsibility.


## 3. Toolset sections

### 3A. Section heading

1. Use an H2 heading prefixed with an exclamation mark (`## !Projects`) to create a toolset section.


### 3B. Resume item heading

1. Use an H3 heading for each resume item.


### 3C. Auxiliary information

1. After an H3, add an indented preformatted block containing 2 lines of auxiliary information: a comma-separated list of tools and technologies, and a date or time range.


### 3D. Description list

1. Same syntax as organisational sections: an unordered list of bullet-point descriptions.


## 4. Catalogue sections

### 4A. Section heading

1. Use an H2 heading to create a catalogue section.
2. A catalogue section contains no H3 subheadings.


### 4B. Item list

1. Use an unordered list directly under the H2 heading.
2. Each item may optionally include a label followed by a colon and a value (e.g. `Languages: Java, Python`).
3. Labels are rendered in bold in the compiled document.


## 5. Hiding elements

### 5A. Hiding sections and items

1. Prefix an H2 or H3 heading with a caret (`^`) to hide the entire section or resume item.
2. When hidden, the heading and all its content (auxiliary information, description list) are omitted from the compiled output.


### 5B. Hiding list items

1. Prefix a list item (`- ^text`) with a caret to hide that single item.
2. This applies to description list items and catalogue section items.


## 6. Comments

1. Plain text that does not belong to a heading, list, or preformatted block is treated as a comment and ignored.
2. Comments are analogous to comments in programming languages: they are visible in the source Markdown but do not appear in the compiled output.


## 7. Escape characters and LaTeX injection

### 7A. Special characters

1. Characters with special meaning in LaTeX must be escaped in Markdown. The following table lists each character and its escape sequence.

| Character |      Escape sequence in Markdown      |
|:---------:|:-------------------------------------:|
|    `&`    |                 `\&`                  |
|    `%`    |                 `\%`                  |
|    `$`    |                 `\$`                  |
|    `#`    | `\#` in code blocks, `\\\#` otherwise |
|    `_`    | `\_` in code blocks, `\\\_` otherwise |
|    `{`    | `\{` in code blocks, `\\\{` otherwise |
|    `}`    | `\}` in code blocks, `\\\}` otherwise |
|    `~`    |           `\textasciitilde`           |
|    `^`    |          `\textasciicircum`           |
|    `\`    |           `\textbackslash`            |


### 7B. LaTeX injection

1. Raw LaTeX code can be injected into the preamble or document body through preformatted code blocks.
2. Escape sequences should still be applied to LaTeX special characters as needed.
