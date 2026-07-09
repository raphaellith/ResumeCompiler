# Resume Syntax Guide

This document describes the Markdown-style syntax used to author a résumé that the Résumé Compiler can parse and compile into a PDF. The syntax extends standard Markdown with conventions for sections, resume items, hiding elements and LaTeX escape sequences.


## 1. Title, subtitle and contact list

1. The title, subtitle (optional), and contact list (optional) must appear before the first section heading.


### 1A. Title

1. Use an H1 heading (`#`) to define the title. The title typically contains the candidate's first and last name.

2. Only one H1 element is permitted. The compiler uses the first H1 as the title.


### 1B. Subtitle

1. Use an indented line to define a subtitle. The subtitle appears below the title as a secondary description.


### 1C. Contact list

1. Use an unordered list (`-` items) after the title to define a contact list. Each list item represents one contact detail (phone number, email address, website, etc.). Contacts are rendered on a single centred line separated by pipe (`|`) characters.

2. Items may be formatted as hyperlinks using standard Markdown link syntax: `[label](url)`.


## 2. Organisational sections

1. Use an H2 heading (`##`) to create a new organisational section.
2. Use an H3 heading (`###`) for each resume item within the section. This heading typically contains a role title such as "Undergraduate Research Assistant".

3. After an H3, add an indented preformatted block containing 3 lines of auxiliary information:  a date or time range (e.g. "June 2020 -- Present"), an organisation name and a location. These fields are laid out from left to right and top to bottom in the compiled PDF.

4. After the auxiliary block, use an unordered list to create a description list for the item. Each list item is one bullet-point description of the achievement or responsibility.


## 3. Toolset sections

1. Use an H2 heading prefixed with an exclamation mark (`## !Projects`) to create a toolset section.

2. Use an H3 heading for each resume item.

3. After an H3, add an indented preformatted block containing 2 lines of auxiliary information: a comma-separated list of tools and technologies, and a date or time range.

4. Description lists for toolset sections follow the same syntax as those for organisational sections: an unordered list of bullet-point descriptions.


## 4. Catalogue sections

1. Use an H2 heading to create a catalogue section.

2. A catalogue section contains no H3 subheadings.

3. Use an unordered list directly under the H2 heading.

4. Each item may optionally include a label followed by a colon and a value (e.g. `Languages: Java, Python`). Labels are rendered in bold in the compiled document.


## 5. Hiding elements

1. Prefix an H2 or H3 heading with a caret (`^`) to hide the entire section or resume item. When hidden, the heading and all its content (auxiliary information, description list) are omitted from the compiled output.

2. Prefix a list item (`- ^text`) with a caret to hide that single item. This applies to description list items and catalogue section items.


## 6. Comments

1. Plain text that does not belong to a heading, list, or preformatted block is treated as a comment and ignored. Comments are analogous to comments in programming languages: they are visible in the source Markdown but do not appear in the compiled output.


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
