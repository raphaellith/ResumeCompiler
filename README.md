# Resume Compiler

A compiler that compiles markdown files into a resume PDF file, formatted using LaTeX.

Resumes outputted by this compiler will follow the structure given by the ["Jake's Resume" template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs).

## Terminology

This section introduces several terms (in bold) used throughout this project and its documentation. The ["Jake's Resume" template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs) will be used as an example.

- **Title.** The candidate's first and last name, as displayed at the top of the resume, e.g. ```Jake Ryan```.
- **Contact information.** A list of the candidate's contact details, e.g. ```123-456-7890 | jake@su.edu | ... | github.com/jake```.
- **Section.** In the resume, all achievements, experiences and projects (resume items) are classified into several categories. Each of these categories constitutes a section of the resultant document, such as ```Education```, ```Experience```, ```Projects``` or ```Technical Skills```. As explained below, a section can be any one of the following:
  - a toolset section,
  - an organisational section, or
  - a catalogue section.
- **Heading.** The text that marks the start of each section.
- **Resume item.** An achievement, experiences or project as listed in a toolset or organisational section. Apart from resume list items (see below), a resume item contains:
  - A subheading that describes the achievement, e.g. ```Undergraduate Research Assistant```.
  - A description list that offers brief details thereof, e.g. ```• Developed a REST API using...```.
  - Other auxiliary information detailing the relevant time, organisation and location, if needed.
- **Subheading.** The text that marks the start of each resume item.
- **Description list.** Each resume item ends with an optional list of sentences providing details to the achievement, experience or project. This is called the description list.
- **Toolset section.** In some sections, resume items are formatted as follows, with the subheading and auxiliary information packed into one row. These resume items usually include information such as tools and skills relevant to the achievement, experience or project. These sections are called toolset sections.

```aiignore
Gitlytics | Python, Flask, React...     June 2020 – Present

• Description list item #1
• Description list item #2
```

- **Organisational section.** In some sections, resume items are formatted like so, with the subheading and auxiliary information placed in a 2x2 grid. These sections are called non-toolset sections.

```aiignore
Undergraduate Research Assistant     June 2020 – Present
Texas A&M University                 College Station, TX

• Description list item #1
• Description list item #2
```

- **Catalogue section.** A type of section that contains a simple unordered list, e.g. ```Technical skills```. Each item in the unordered list may optionally begin with a label (e.g. ```Languages```).


## Syntax

### Add a title and contact list

A title can be added using an H1 line.

```aiignore
# Jake Ryan
```

If the H1 line is followed by an unordered list, that list is taken to be a contact list.

```aiignore
# Jake Ryan
- 123-456-7890
- jake@su.edu
```

The contact list may contain items that are hyperlinks. If a contact list item contains both a hyperlink(s) and plain text, only the first hyperlink will be displayed.


### Add an organisational section

Create a new section by adding an H2 heading.

```aiignore
## Education
```

For each resume item, create an H3 subheading. This is followed by an indented block containing three lines of auxiliary information. These will appear from left to right and from top to bottom in the compiled document.

```aiignore
### Undergraduate Research Assistant 
    June 2020 – Present
    Texas A&M University
    College Station, TX
```

Add a description list by adding an unordered list afterwards.

```aiignore
### Undergraduate Research Assistant 
    June 2020 – Present
    Texas A&M University
    College Station, TX

- Description list item #1
- Description list item #2
```


### Add a toolset section

Create a new section by adding an H2 heading. Prefix the heading with an exclamation mark to indicate that this is a toolset section.

```aiignore
## !Projects
```

For each resume item, create an H3 subheading. This is followed by an indented block containing two lines of auxiliary information. These will appear from left to right in the compiled document.

```aiignore
### Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 – Present
```

Add a description list by adding an unordered list afterwards.

```aiignore
### Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 – Present

- Description list item #1
- Description list item #2
```


### Add a catalogue section

Create a new section by adding an H2 heading. A catalogue section contains no resume items, so do not add any H3 subheadings here.

```aiignore
## Technical Skills
```

Complete the catalogue section by adding an unordered list. Each item in the unordered list may optionally begin with a label (e.g. Languages), like so:

```aiignore
## Technical Skills

- Languages: Java, Python, ...
- Another label: Something else, ...
```


### Add comments

Any text that is not part of a title, contact list, heading, subheading or resume item (i.e. that when translated to HTML does not belong to a tag) will be ignored and treated as a comment.


## A note on LaTeX injections

It is possible to inject LaTeX code into markdown source code (especially in preformatted code blocks), but precautions and checking must be done.


## Future improvements

- More font choices apart from Times New Roman
- More robust parsing and compilation
- More user-friendly error handling
- Better organisation of auxiliary functions
- UML visualisation of classes
- More mature handling of LaTeX injection