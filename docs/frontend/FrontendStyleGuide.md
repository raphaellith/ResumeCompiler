# Frontend Style Guide

This document describes the design principles, colour system, typography, iconography, and UI component conventions used in the Resume Compiler frontend.

## 1. Design principles

1. All colour values have a single source of truth in `src/styles/_variables.scss`. No colour is hard-coded in component code.
2. Styles are scoped per component using SCSS Modules (`.module.scss`). Global styles are limited to `src/styles/global.scss`.
3. Interactive components (buttons, dialogs, menus, selects) use Material UI (MUI) with a custom theme that reflects the application colour scheme.
4. The colour identity centres on a dark green primary, an off-white secondary, and a gold accent.

## 2. Colour scheme and single source of truth

### 2A. Source of truth

1. All colour values are defined as SCSS variables in `src/styles/_variables.scss`. This file is the single source of truth; visual tokens are never hard-coded elsewhere.
2. Only three base hex colours are hand-written:
   - `$color-dominant: #2d6148` (dark green).
   - `$color-secondary: #f9fafb` (off-white).
   - `$color-accent: #efbf43` (gold).
3. Derived colours are computed with `sass:color.mix()`:
   - `$color-dominant-light` — dominant mixed with white at 75 %.
   - `$color-dominant-border` — dominant-light mixed with black at 90 %.
   - `$color-accent-dark` — accent mixed with black at 40 %.

### 2B. Using colours in SCSS files

1. Component SCSS files import the variables partial with `@use '../../styles/variables' as *` and reference the variables directly.
2. No `var()` function or CSS custom property is used. Values are baked in at build time.

### 2C. Using colours in TypeScript

1. `src/styles/variables.module.scss` re-exports every variable through Sass's `:export` block, making them available as a TypeScript module.
2. TypeScript components import this module and use the exported values for MUI theme configuration, inline styles, and Monaco editor colour setup.
3. `variables.module.scss` is the only file imported from TypeScript for colour values.

### 2D. Global styles

1. `src/styles/global.scss` sets `:root`, `*`, and `body` rules. It imports `_variables.scss` and applies the tokens as regular CSS properties.
2. It is imported once in `src/main.tsx`.

### 2E. Adding a new colour

1. Add the new variable in `src/styles/_variables.scss`. If it derives from an existing colour, use `sass:color.mix()`. For completely new colours, hard-code the hex value.
2. If the colour needs to be accessible from TypeScript, add a corresponding `:export` entry in `src/styles/variables.module.scss`.
3. Reference the SCSS variable in component SCSS files, or import the module SCSS file in TypeScript components.

## 3. Fonts

1. The application font is `'Lato', 'Helvetica Neue', sans-serif`, defined in `$font-family` in `_variables.scss`.
2. This font family is applied to `:root` in `global.scss` and wired to MUI's `typography.fontFamily` in the custom theme.
3. Lato is loaded from Google Fonts.

## 4. Icons

1. Icons use the Material Symbols library via the `material-symbols-outlined` CSS class.
2. The settings gear icon and export dropdown arrow are rendered using Material Symbols.
3. Material Symbols class names are referenced in SCSS modules using the `:global()` pseudo-selector.

## 5. UI component library

1. The frontend uses Material UI (MUI) v9 (`@mui/material`, `@emotion/react`, `@emotion/styled`).
2. A custom MUI theme is defined in `App.tsx` using SCSS variable exports.
3. Theme palette mapping:
   - `primary.main` maps to the gold accent (`$color-accent`).
   - `secondary.main` maps to the dark green dominant (`$color-dominant`).
   - `background.default` maps to the dark green dominant.
   - `background.paper` maps to the dominant-light variant.
   - `text.primary` maps to the off-white secondary.
4. The following MUI components have custom style overrides: `MuiButton`, `MuiDialog`, `MuiDialogTitle`, `MuiDialogContent`, `MuiDialogActions`, `MuiOutlinedInput`, `MuiInputLabel`, `MuiMenu`, `MuiMenuItem`, `MuiSelect`, `MuiPaper`.

## 6. Component styling approach

1. Every component has a co-located SCSS Module file (`ComponentName.module.scss`).
2. SCSS Modules produce hashed class names to avoid collisions.
3. Component styles import `_variables.scss` for colour tokens.
4. Empty SCSS Module files are kept for consistency even when no component-specific styles are defined.

## 7. Monaco editor integration

1. The Markdown editor uses `@monaco-editor/react`.
2. A custom Monaco theme named `"resume-compiler"` is defined on component mount with a background matching `$color-secondary`.
3. The editor language is set to `"markdown"`.
4. Font size is adjustable by the user between 8 px and 24 px with a default of 12 px.
