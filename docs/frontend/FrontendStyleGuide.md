# Frontend Style Guide

This document describes the colour system, typography, iconography, and UI component conventions used in the Résumé Compiler frontend.


## 1. Colours

### 1A. Colour definitions and single source of truth

1. All colour values have a single source of truth in `src/styles/_variables.scss`. Never use hard-coded colour values anywhere else. Resultant variables are exported for use in TypeScript through `src/styles/variables.module.scss`.

2. Per-component styles are placed in SCSS Modules (`.module.scss`). Global styles are defined in `src/styles/global.scss`.

3. Empty SCSS Module files are kept for consistency even when no component-specific styles are defined.


### 1B. Selected colours

1. The frontend design adopts the following colour identity: a dark green primary (`$color-dominant: #2d6148`), an off-white secondary (`$color-secondary: #f9fafb`), and a gold accent (`$color-accent: #efbf43`).

2. Compute derived colours with `sass:color.mix()`.
   - `$color-dominant-light: color.mix($color-dominant, #fff, 75%)`
   - `$color-dominant-border: color.mix($color-dominant-light, #000, 90%)`
   - `$color-accent-dark: color.mix($color-accent, #000, 40%)`

3. `$breakpoint-mobile: 960px` defines the mobile breakpoint, consumed via the `respond-mobile` mixin.


### 1C. Export into TypeScript

1. `src/styles/variables.module.scss` re-exports the variables via `:export` under camelCase keys: `colorDominant`, `colorSecondary`, `colorAccent`, `colorDominantLight`, `colorDominantBorder`, `colorAccentDark`, `fontFamily`.


## 2. Fonts

1. The frontend adopts `'Lato', 'Helvetica Neue', sans-serif` as the main font.

2. The editor pane adopts the font `'"JetBrains Mono", "SFMono-Regular", "Menlo", "Consolas", monospace'`.

3. Lato and JetBrains Mono are loaded from Google Fonts. The `<link>` tag's `href` attribute lists families in alphabetical order. The stylesheet is preconnected via `rel="preconnect"`.

4. The Material Symbols stylesheet is also loaded from Google Fonts, restricted to the two icons actually used via the `icon_names` query parameter (see section 3).


## 3. Icons

1. The frontend loads icons from the Material Symbols library via the `material-symbols-outlined` CSS class.
   - The Export dropdown menu uses the `arrow_drop_down` icon.
   - The Settings button uses the `settings` icon.

2. The Google Fonts stylesheet passes `icon_names=arrow_drop_down,settings`, so only those two glyphs are fetched.

3. SCSS modules use the `:global()` pseudo-selector to reference Material Symbols class names (e.g. in `Toolbar.module.scss`).


## 4. Material UI (MUI)

1. The frontend loads interactive UI components (e.g. buttons, button groups, dropdown menus, dialogs and selects) from MUI.

2. `App.tsx` defines a custom MUI theme based on the application colour scheme.


## 5. Monaco editor integration

1. The frontend uses `@monaco-editor/react` for the Markdown editor.

2. The frontend defines a custom Monaco theme named `"resume-compiler"` on component mount. The theme's background colour matches `$color-secondary`.

3. The editor language is set to `"markdown"` and the tab size is 4 spaces in insert-spaces mode.