# Resume Compiler Frontend Specification

This document outlines the specifications and requirements for the frontend of the Resume Compiler application.


## 1. Basic layout

1. The frontend of the application consists of a window two side-by-side panes.
2. The left pane is the editor and the right pane is the PDF preview.
3. A toolbar, containing a collection of buttons, is located above the panes.


## 2. Editor pane

1. The editor pane consists of a text editor for editing the Markdown code.
2. The editor pane initially empty and disabled; it becomes enabled only when a file is selected via the "Select File" button.
3. Changes made to the editor pane contents are automatically saved to the Markdown file from which they are originally loaded.
4. The editor should be able to handle the insertion (Tab) and deletion (Shift + Tab) of tabs, with a tab size of 4 spaces.
5. The editor pane should support font size adjustments via keyboard shortcuts, including Increase Font Size (Ctrl/Cmd + Plus), Decrease Font Size (Ctrl/Cmd + Minus), and Reset Font Size (Ctrl/Cmd + 0). The default font size should be set to 12px, with a minimum of 8px and a maximum of 24px.


## 3. PDF preview pane

1. The PDF preview pane displays the compiled PDF output of the Markdown code in the editor pane.
2. The PDF preview pane is initially empty; it becomes populated with the compiled PDF output when a file is selected and compiled.
3. If compilation fails, the PDF preview pane displays an error message indicating the failure.


## 4. Toolbar

### A. "Select File" button

1. The "Select File" button is always enabled.
2. The "Select File" button allows the user to upload a Markdown file and loading it into the editor pane. Once the file is loaded into the editor, it is immediately compiled once.


### B. "Compile" button

1. The "Compile" button is initially disabled; it becomes enabled when a file is selected and loaded into the editor pane.
2. The "Compile" button sends the Markdown code in the editor pane to the backend's `/pdf` endpoint for compilation. Upon receiving the response, it is used to update the PDF preview pane with the compiled output.


### C. "Export" dropdown menu

1. The "Export" button is stylised as "Export ▼", is a dropdown menu button.
2. The "Export" button is initially disabled; it becomes enabled when the PDF preview pane is populated with the compiled PDF output.
3. Clicking the "Export ▼" button toggles a dropdown with two menu items: "Export PDF" and "Export XML".
4. The dropdown closes on item selection, clicking outside the menu, or pressing Escape.


#### C1. "Export PDF" menu item (primary action)

1. The "Export PDF" menu item is a primary option.
2. When clicked, the frontend prompts the user to export and download the compiled PDF résumé.


#### C2. "Export XML" menu item (secondary action)

1. The "Export XML" menu item is a secondary option.
2. When clicked, the frontend sends the Markdown code in the editor pane to the backend's `/xml` endpoint for conversion to XML. Upon receiving the response, it prompts the user to export and download the XML file.


## 5. Theming and colour system

### 5.1 Source of truth

All colour values live in `src/styles/_variables.scss` as SCSS variables. This file is the single source of truth — visual tokens are **never** hard-coded elsewhere.

Only the three base hex colours are hand-written; derived colours are computed with `sass:color.mix()`:

```scss
// src/styles/_variables.scss
@use 'sass:color';

$color-dominant: #2d6148;          // hand-written
$color-secondary: #f9fafb;         // hand-written
$color-accent: #efbf43;            // hand-written

$color-dominant-light:  color.mix($color-dominant, #fff, 75%);  // computed
$color-dominant-border: color.mix($color-dominant-light, #000, 90%);  // computed
$color-accent-dark:     color.mix($color-accent, #000, 40%);  // computed
$font-family: 'Lato', 'Helvetica Neue', sans-serif;
```

### 5.2 Using colours in SCSS files (`*.module.scss`)

Component SCSS files import the variables partial with `@use` and reference the variables directly:

```scss
@use '../../styles/variables' as *;

.pane {
  border: 1px solid $color-dominant-border;
  background: $color-dominant-light;
}
```

No `var()` function or CSS custom property is needed — values are baked in at build time.

### 5.3 Using colours in TypeScript via `:export`

`src/styles/variables.module.scss` re-exports every variable through Sass's `:export` block, making them available as a TypeScript module:

```scss
@use 'variables' as *;

:export {
  colorDominant: $color-dominant;
  colorSecondary: $color-secondary;
  colorAccent: $color-accent;
  colorDominantLight: $color-dominant-light;
  colorDominantBorder: $color-dominant-border;
  colorAccentDark: $color-accent-dark;
  fontFamily: $font-family;
}
```

Import in TypeScript:

```ts
import vars from '../../styles/variables.module.scss';

// Use in MUI theme, sx props, style props, etc.
createTheme({
  palette: {
    primary: { main: vars.colorAccent },
  },
});
```

`variables.module.scss` is the **only** file imported from TypeScript for colour values. Component SCSS files use `_variables.scss` directly.

### 5.4 Global styles

`src/styles/global.scss` emits the `:root`, `*`, and `body` rules. It imports `_variables.scss` and applies the tokens as regular CSS properties. It is imported once in `main.tsx`.

### 5.5 Adding a new colour

1. Add the new variable in `src/styles/_variables.scss`. If it derives from an existing colour, use `sass:color.mix()`. For completely new colours, hard-code the hex value.
2. If the colour needs to be accessible from TypeScript, add a corresponding `:export` entry in `src/styles/variables.module.scss`.
3. Reference the SCSS variable in component SCSS files, or import the module SCSS file in TypeScript components.
