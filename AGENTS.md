# AGENTS.md

Tauri 2 desktop shell → React 19 SPA (Vite 7, port 1420 strict) ↔ Python FastAPI backend on `127.0.0.1`. No bundling — both run independently.

## Backend

```sh
pip install -r requirements.txt
uvicorn backend.controller.api_controller:app          # default :8000 (what frontend expects)
python backend/run.py                                  # default :8001 (used by Tauri sidecar)
```

- **Must run from repo root** (`backend.*` absolute imports). `venv/` exists at root.
- Requires `pdflatex` on `$PATH` (system LaTeX distribution).
- `POST /pdf/?font=kebab-case-name` → `application/pdf`; `POST /xml/` → `application/xml` (debug component tree). Both accept `{"markdown": "..."}`. Default font: `times-new-roman`.
- Pipeline: Markdown → BeautifulSoup → `Resume` component tree → `to_latex_lines()` → `preamble.tex` (font placeholder `% FONT CHOICE GOES HERE`) → `pdflatex` in temp dir → PDF bytes. Entrypoint: `backend.service.markdown_to_pdf_bytes_compilation_service.get_pdf_bytes_from_markdown`.
- CORS restricted to known frontend origins: `http://localhost:1420` (Vite dev), `tauri://localhost` and `https://tauri.localhost` (Tauri webview).

## Frontend

```sh
cd frontend/resumecompiler
npm install
npm run dev         # Vite :1420 (strictPort)
npm run build       # tsc && vite build
npm run tauri dev   # Tauri desktop (dev, runs Vite + sidecar)
npm run tauri build # Tauri desktop (release)
```

- `VITE_RESUME_COMPILER_API_BASE_URL` overrides default backend URL (`http://localhost:8000`); resolved in `src/config/api.ts`.
- Tauri CSP disabled (`"csp": null` in `tauri.conf.json`). Offline PDF preview requires backend; no mock script.
- Frontend `.gitignore` covers Node/IDE/OS artifacts separately from root. Root `.gitignore` only ignores `.pypirc`.

## Tauri sidecar architecture

- `tauri.conf.json` declares `externalBin: ["binaries/backend"]`. At runtime Tauri spawns the PyInstaller-built binary with `--port <random-free-port>`, reads stderr for logs, and exposes the port to the frontend via `get_backend_port` Tauri command (`src-tauri/src/lib.rs`).
- Sidecar binary placed at `src-tauri/binaries/backend-<target-triple>` (built by CI, not committed — gitignored in `src-tauri/.gitignore`).

## CI / Release

- `.github/workflows/release.yml`: triggered by `v*` tag push.
- Builds Python sidecar with `pyinstaller --onefile --hidden-import uvicorn...` using `backend/run.py` as entrypoint, then `npm run tauri build`.
- `backend/build.spec` is the local PyInstaller spec for reference.

## Markdown quirks

- `^` prefix on H2/H3 hides entire sections/items. `^` prefix on `<li>` hides that line. Stripped in `process_hidden_elements()` (`backend/model/resume_components/resume.py`).
- `!` prefix on H2 switches section to "toolset" mode (subheading + toolset + date vs organisation + location). Detected in `get_resume_section_from_tags()`.

## No tooling

- **No tests** (no test files, no test script in `package.json`).
- **No linter, no formatter, no pre-commit hook configured.**
- `docs/` contains design specs for deeper reference.
