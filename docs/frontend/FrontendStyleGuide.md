# Frontend Style Guide

This document describes the colour system, typography, iconography, and UI component conventions used in the Resume Compiler frontend.


## 1. Colours

### 1A. Colour definitions and single source of truth

1. All colour values have a single source of truth in `src/styles/_variables.scss`. Never use hard-coded colour values anywhere else. Resultant variables are exported for use in TypeScript through `src/styles/variables.module.scss`.

2. Per-component styles are placed in SCSS Modules (`.module.scss`). Global styles are defined in `src/styles/global.scss`.

3. Empty SCSS Module files are kept for consistency even when no component-specific styles are defined.


### 1B. Selected colours

1. The frontend design adopts the following colour identity: a dark green primary (`$color-dominant: #2d6148`), an off-white secondary (`$color-secondary: #f9fafb`), and a gold accent (`$color-accent: #efbf43`). Compute all derived colours with `sass:color.mix()`.


## 2. Fonts

1. The frontend adopts `'Lato', 'Helvetica Neue', sans-serif` as the main font.

2. The editor pane adopts the font `'"JetBrains Mono", "SFMono-Regular", "Menlo", "Consolas", monospace'`.

3. Lato and JetBrains Mono are loaded from Google Fonts.

4. For Google Fonts imports, the `<link>` tag's `href` attribute lists fonts in alphabetical order.


## 3. Icons

1. The frontend loads icons from the Material Symbols library via the `material-symbols-outlined` CSS class.
   - The Export dropdown menu uses the `arrow_drop_down` icon.
   - The Settings button uses the `settings` icon.
   
2. SCSS modules use the `:global()` pseudo-selector to reference Material Symbols class names.


## 4. Material UI (MUI)

1. The frontend loads interactive UI components (e.g. buttons, button groups and dropdown menus) from MUI.

2. `App.tsx` defines a custom MUI theme based on the application colour scheme.


## 5. Monaco editor integration

1. The frontend uses `@monaco-editor/react` for the Markdown editor.

2. The frontend defines a custom Monaco theme named `"resume-compiler"` on component mount. The theme's background colour matches `$color-secondary`.

3. The editor language is set to `"markdown"`.
