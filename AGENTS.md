# AGENTS.md

## Two-process architecture

- **Backend** — Python FastAPI server on port `8000`. Serves `POST /pdf/` (returns `application/pdf`) and `POST /xml/` (returns `application/xml` for debugging). Accepts `{"markdown": "..."}`.
- **Frontend** — React 19 + TypeScript SPA (Vite 7, port `1420`), optionally wrapped in a Tauri 2 desktop shell. Calls backend via `POST /pdf/` and `POST /xml/`.
- Both run independently. No bundling.

## Backend

```sh
pip install -r requirements.txt
uvicorn backend.controller.api_controller:app
```

- Must run from repo root (uses `backend.*` absolute imports).
- Requires `pdflatex` on `$PATH` (system LaTeX distribution).
- CORS: wide open (`allow_origins=["*"]`). Acceptable for local-only use.
- Compilation pipeline: Markdown → BeautifulSoup → `Resume` component tree (`backend/model/resume_components/`) → `to_latex_lines()` → `preamble.tex` template with font substituted in → `pdflatex` in temp dir → PDF bytes. Entrypoint: `backend.service.markdown_to_pdf_bytes_compilation_service.get_pdf_bytes_from_markdown`.
- `POST /pdf/` accepts optional query param `?font=times-new-roman` (kebab-case, see `backend/model/enums/font.py` `from_query_parameter`). Default: `times-new-roman`.
- `POST /xml/` returns the parsed `Resume` component tree as XML (no LaTeX/PDF step).
- The Python package is published on PyPI as `resumecompiler` (see `README.md` for CLI/library API). Build config (`pyproject.toml`/`setup.py`) lives on `main` branch; not present on feature branches. `.pypirc` (PyPI token) is gitignored at repo root.

## Frontend

```sh
cd frontend/resumecompiler
npm install
npm run dev              # Vite dev server on :1420 (strictPort)
npm run build            # tsc && vite build
npm run preview          # Vite preview
npm run tauri dev        # Tauri desktop (dev)
npm run tauri build      # Tauri desktop (release)
```

- `VITE_RESUME_COMPILER_API_BASE_URL` env var overrides default backend URL (`http://localhost:8000`); resolved in `src/config/api.ts`.
- Vite pinned to port `1420` (`strictPort: true`); Tauri expects this exact port.
- React app structure (`src/`):
  - `App.tsx` — root layout; split editor + PDF preview panes with resizable handle.
  - `components/` — `MarkdownEditorPane`, `Pane`, `PdfPreviewPane`, `ResizableHandle`, `SettingsModal`, `Toolbar`, `CompilationErrorMessage`, `SettingRow`.
  - `hooks/` — `useMarkdownDocument` (file state), `usePdfCompilation` (POSTs to `/pdf/`), `useSaveMarkdownOnClose` (auto-persist via Tauri fs), `useXmlExport` (POSTs to `/xml/`).
  - `config/` — `api.ts` (API base URL, endpoints), `font.ts` (font options list, default).
- Dependencies: MUI (`@mui/material` v9, `@emotion/react`, `@emotion/styled`), Monaco editor (`@monaco-editor/react`), Tauri 2 plugins (`@tauri-apps/api`, `plugin-dialog`, `plugin-fs`, `plugin-opener`).
- MUI theme is customised inline in `App.tsx` (uses SCSS variables from `styles/variables.module.scss`). Follow existing theme overrides for new MUI components.
- Offline PDF preview requires backend running; no mock script exists.
- Tauri CSP disabled (`"csp": null` in `tauri.conf.json`).

## Markdown quirks

- `^` prefix on H2/H3 hides entire sections/items. `^` prefix on `<li>` hides that line. Stripping happens in `process_hidden_elements()` (`backend/model/resume_components/resume.py`) before component parsing.
- `!` prefix on H2 switches a section to "toolset" mode (subheading + toolset + date vs organisation + location). Detection in `get_resume_section_from_tags()` (`backend/model/resume_components/resume.py`).
- `% FONT CHOICE GOES HERE` placeholder in `backend/model/resources/preamble.tex` (line 17) — replaced at compile time by the `Font` enum value. See `backend/model/enums/font.py` for available values.

## Notable

- **No tests** exist anywhere (`.pytest_cache/` present but zero test source files; no `npm test`).
- **Repo root `.gitignore`** only ignores `.pypirc`; IDE/Python/Node artefacts are not tracked-ignored.
