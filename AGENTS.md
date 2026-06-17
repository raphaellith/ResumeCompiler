# AGENTS.md

This is a desktop app — a Tauri 2 shell wrapping a React frontend, backed by a local Python FastAPI server.

## Two-process architecture

- **Backend** — Python FastAPI server on port `8000`. `POST /pdf/` returns `application/pdf`; `POST /xml/` returns `application/xml` (debug component tree). Both accept `{"markdown": "..."}`.
- **Frontend** — React 19 + TypeScript SPA (Vite 7, port `1420`), optionally wrapped in Tauri 2 desktop shell.
- Both run independently. No bundling.

## Backend

```sh
pip install -r requirements.txt
uvicorn backend.controller.api_controller:app
```

- **Must run from repo root** (`backend.*` absolute imports). A `venv/` already exists at repo root.
- Requires `pdflatex` on `$PATH` (system LaTeX distribution).
- CORS: wide open (`allow_origins=["*"]`). Acceptable for local-only use.
- Compilation pipeline: Markdown → BeautifulSoup → `Resume` component tree (`backend/model/resume_components/`) → `to_latex_lines()` → `preamble.tex` (font placeholder `% FONT CHOICE GOES HERE`) → `pdflatex` in temp dir → PDF bytes. Entrypoint: `backend.service.markdown_to_pdf_bytes_compilation_service.get_pdf_bytes_from_markdown`.
- `POST /pdf/?font=kebab-case-font-name` — query param parsed by `Font.from_query_parameter` in `backend/model/enums/font.py`. Default: `times-new-roman`.

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

- `VITE_RESUME_COMPILER_API_BASE_URL` overrides default backend URL (`http://localhost:8000`); resolved in `src/config/api.ts`.
- Vite pinned to port `1420` (`strictPort: true`); Tauri expects this exact port.
- **Components** (`src/components/`): `MarkdownEditorPane` (Monaco), `PdfPreviewPane`, `ResizableHandle`, `SettingsModal`, `Toolbar`, `CompilationErrorMessage`, `SettingRow`.
- **Hooks** (`src/hooks/`): `useMarkdownDocument` (file state), `usePdfCompilation` (POSTs to `/pdf/`), `useSaveMarkdownOnClose` (auto-persist via Tauri fs), `useXmlExport` (POSTs to `/xml/`).
- **Config** (`src/config/`): `api.ts` (base URL, endpoints), `font.ts` (font options list, default).
- MUI theme customised inline in `App.tsx` using SCSS variables from `styles/variables.module.scss`. Follow existing theme overrides for new MUI components.
- Tauri CSP disabled (`"csp": null` in `src-tauri/tauri.conf.json`).
- Offline PDF preview requires backend running; no mock script exists.
- `frontend/resumecompiler/.gitignore` covers Node/IDE/OS artifacts separately from root.

## Markdown quirks

- `^` prefix on H2/H3 hides entire sections/items. `^` prefix on `<li>` hides that line. Stripping in `process_hidden_elements()` (`backend/model/resume_components/resume.py`).
- `!` prefix on H2 switches a section to "toolset" mode (subheading + toolset + date vs organisation + location). Detection in `get_resume_section_from_tags()` (`backend/model/resume_components/resume.py`).

## Notable

- **No tests** (no test source files, no `npm test` script).
- **Root `.gitignore`** only ignores `.pypirc`. `venv/`, `__pycache__/`, `.pytest_cache/`, `.idea/`, `.DS_Store` are **not** gitignored at root level.
- `docs/` directory contains backend/frontend design specs for deeper reference.
