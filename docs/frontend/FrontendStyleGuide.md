# Frontend Style Guide

This document describes the colour system, typography, iconography, and UI component conventions used in the Resume Compiler frontend.


## 1. Colours

### 1A. Colour definitions and single source of truth

1. Maintain a single source of truth for all colour values in `src/styles/_variables.scss`. Never use hard-coded colour values anywhere else. Resultant variables are exported for use in TypeScript through `src/styles/variables.module.scss`.
2. Place per-component styles in SCSS Modules (`.module.scss`). Define global styles in `src/styles/global.scss`.
3. Keep empty SCSS Module files for consistency even when no component-specific styles are defined.


### 1B. Selected colours

1. Centre the frontend design with the following colour identity: a dark green primary (`$color-dominant: #2d6148`), an off-white secondary (`$color-secondary: #f9fafb`), and a gold accent (`$color-accent: #efbf43`). Compute all derived colours with `sass:color.mix()`.


## 2. Fonts

1. Adopt `'Lato', 'Helvetica Neue', sans-serif` as the main application font..
2. Adopt the font `'"JetBrains Mono", "SFMono-Regular", "Menlo", "Consolas", monospace'` for use in the editor pane.
3. Load Lato and JetBrains Mono from Google Fonts.
4. For Google Fonts imports, ensure that the `<link>` tag's `href` attribute lists fonts in alphabetical order.


## 3. Icons

1. Load icons from the Material Symbols library via the `material-symbols-outlined` CSS class.
2. Reference Material Symbols class names in SCSS modules using the `:global()` pseudo-selector.


## 4. Material UI (MUI)

1. Load interactive components from MUI. `App.tsx` defines a custom MUI theme based on the application colour scheme.


## 5. Monaco editor integration

1. Use `@monaco-editor/react` for the Markdown editor.
2. A custom Monaco theme named `"resume-compiler"` is defined on component mount with a background matching `$color-secondary`.
3. Set the editor language to `"markdown"`.
4. Font size is user-adjustable between 8px and 24px with a default of 12px.
