# Resume Compiler

A desktop app that compiles Markdown into a formatted resume PDF using LaTeX.

Built with a Tauri 2 shell wrapping a React 19 frontend (Vite 7), backed by a Python FastAPI server. Resumes follow the ["Jake's Resume" template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs).


## Running

Start the backend (from repo root):

```sh
pip install -r requirements.txt
uvicorn backend.controller.api_controller:app
```

Start the frontend (separate terminal):

```sh
cd frontend/resumecompiler
npm install
npm run dev
```

Or launch the Tauri desktop app:

```sh
cd frontend/resumecompiler
npm run tauri dev
```


## Terminology

This section introduces several terms (in bold) used throughout this project and its documentation. The ["Jake's Resume" template](https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs) is used as an example.

A resume begins with a **title** stating the candidate's first and last name, e.g. ```Jake Ryan```.

There may also be a **subtitle**, a brief line describing the candidate.

Below that is a **contact list**, which provides the candidate's contact details, e.g.
```
123-456-7890 | jake@su.edu | ... | github.com/jake
```

In a resume, all achievements, projects and skills are categorised into separate **sections**. Each section is marked with a **heading**, such as ```Education```, ```Experience```, ```Projects``` or ```Technical Skills```.

There are 3 types of sections:

  - **A toolset section**
  - **An organisational section**
  - **A catalogue section**

A toolset section contains a list of **resume items**, each of which includes:
- a **subheading** describing the achievement (e.g. ```Gitlytics```),
- a **toolset** listing the tools involved (e.g. ```Python, Flask, ...```)
- the time and duration thereof, and
- a **description list**, which is a collection of sentences detailing the achievement (e.g. ```Developed a full-stack web application...```).

A resume item in a toolset section is formatted like this:
```aiignore
Gitlytics | Python, Flask, React...     June 2020 – Present

• Description list item #1
• Description list item #2
```

An organisational section also has a list of resume items. Each resume item in an organisational section contains:
- a subheading describing the achievement (e.g. ```Undergraduate Research Assistant```),
- the time, organisation and location associated therewith, and
- a description list (e.g. ```Developed a REST API using...```).

A resume item in an organisational section is formatted like this:

```aiignore
Undergraduate Research Assistant     June 2020 – Present
Texas A&M University                 College Station, TX

• Description list item #1
• Description list item #2
```

A catalogue section does not contain any resume items. Instead, it displays a simple unordered list, formatted like this:

```aiignore
• Languages: Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R
• Frameworks: React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI
• Developer Tools: Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse
• Libraries: pandas, NumPy, Matplotlib
```

In the above example, the text before each colon (```Languages```, ```Frameworks```, etc.) are called labels and are formatted in bold.



## Syntax

### Create a title, subtitle and contact list

Use an H1 line to create a title.

```aiignore
# Jake Ryan
```

Use a preformatted block to create a subtitle.

```aiignore
    A brief subtitle
```

Use an unordered list to create a contact list. Contacts may include hyperlinks.

```aiignore
# Jake Ryan
- 123-456-7890
- jake@su.edu
- [resume-compiler.com](resume-compiler.com)
```

The title, subtitle and contact list must precede the first section.


### Create an organisational section

Use an H2 heading to create a new section.

```aiignore
## Education
```

Add an H3 subheading for each resume item. Use an indented preformatted code block to add 3 lines of auxiliary information.

```aiignore
### Undergraduate Research Assistant 
    June 2020 - Present
    Texas A&M University
    College Station, TX
```

The subheading and auxiliary information will appear from left to right and from top to bottom in the compiled document.

Then, use an unordered list to create a description list.

```aiignore
### Undergraduate Research Assistant 
    June 2020 - Present
    Texas A&M University
    College Station, TX

- Description list item #1
- Description list item #2
```


### Create a toolset section

Use an H2 heading to create a new section. To indicate that this is a toolset section, prefix the heading with an exclamation mark.

```aiignore
## !Projects
```

Add an H3 subheading for each resume item. Use an indented preformatted code block to add 2 lines of auxiliary information.

```aiignore
### Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 - Present
```

The subheading and auxiliary information will appear from left to right in the compiled document.

Then, use an unordered list to create a description list.

```aiignore
### Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 - Present

- Description list item #1
- Description list item #2
```


### Create a catalogue section

Create a new section by adding an H2 heading. A catalogue section contains no resume items, so do not add any H3 subheadings here.

```aiignore
## Technical Skills
```

Create an unordered list. Each item in the unordered list may optionally begin with a label followed by a colon.

```aiignore
## Technical Skills

- Languages: Java, Python, ...
- Another label: Something else, ...
```

Labels are formatted in bold in the compiled document.


### Comments

Any plain text that is not part of a title, contact list, heading, subheading or resume item (i.e. that when translated to HTML does not belong to a tag) will be ignored. This is analogous to comments in most programming languages.


### Hide resume items

You can hide resume sections, resume items, description list items, or catalogue section items. A hidden element will not appear in the compiled document.

To hide a resume section or resume item, prefix its heading or subheading with a caret (```^```).

```aiignore
## ^Education
```

```aiignore
### ^Gitlytics
    Python, Flask, React, PostgreSQL, Docker
    June 2020 - Present

- Description list item #1
- Description list item #2
```

When you do this, the entire resume section or item (not just the heading or subheading) will disappear from the compiled document.

Similarly, to hide a description list item or catalogue section item, simply prefix that item with a caret.

```aiignore
- ^Description list item #1
```

```aiignore
- ^Languages: Java, Python, ...
```



### On escape characters and LaTeX injections.

Some characters have special meaning in LaTeX and should be escaped using backslashes (```\```) when writing Markdown source code. See table below.

| Character |                Escape sequence in Markdown                 |
|:---------:|:----------------------------------------------------------:|
|  ```&```  |                          ```\&```                          |
|  ```%```  |                          ```\%```                          |
|  ```$```  |                          ```\$```                          |
|  ```#```  | ```\#``` in preformatted code blocks, ```\\\#``` otherwise |
|  ```_```  | ```\_``` in preformatted code blocks, ```\\\_``` otherwise |
|  ```{```  | ```\{``` in preformatted code blocks, ```\\\{``` otherwise |
|  ```}```  | ```\}``` in preformatted code blocks, ```\\\}``` otherwise |
|  ```~```  |                   ```\textasciitilde```                    |
|  ```^```  |                   ```\textasciicircum```                   |
|  ```\```  |                    ```\textbackslash```                    |

When necessary, it is possible to inject LaTeX code into Markdown source code (especially in preformatted code blocks). Note, however, that precautions should be taken and escape sequences should be used.


## Compilation

The frontend sends markdown to the backend API:

- `POST /pdf/?font=kebab-case-font-name` — returns `application/pdf`
- `POST /xml/` — returns `application/xml` (debug component tree)

Both accept `{"markdown": "..."}`. Available fonts are listed in `frontend/resumecompiler/src/config/font.ts`; the default is Times New Roman (`times-new-roman`).


## Future improvements

Future improvements with regard to more robust parsing and compilation:

- More user-friendly error handling
- More mature handling of escape characters and LaTeX injection
- UML visualisation of classes