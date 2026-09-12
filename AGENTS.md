# AGENTS.md

Tauri 2 desktop shell → React 19 SPA (Vite 7, port 1420 strict) ↔ Python FastAPI backend on `127.0.0.1`. No bundling — both run independently.

## Backend

```sh
pip install -r requirements.txt
uvicorn backend.controller.api_controller:app          # default :8000
python backend/run.py                                  # default :8000 (Tauri sidecar passes random --port)
```

- **Must run from repo root** (`backend.*` absolute imports). `venv/` exists at root.
- Requires `pdflatex` on `$PATH` (system LaTeX distribution).
- Endpoints: `GET /health` (frontend readiness poll), `GET /font-names` (valid font names + default), `POST /pdf?font=kebab-case-name` → `application/pdf`, `POST /xml` → `application/xml` (debug component tree). Both POSTs accept `{"markdown": "..."}`. Default font: `times-new-roman`.
- Pipeline: Markdown (YAML frontmatter + body) → BeautifulSoup → `Resume` component tree → `to_latex()` → `template.tex` (`%[[PLACEHOLDER]]%` slots) → `pdflatex` in temp dir → PDF bytes. Entrypoint: `backend.service.markdown_to_pdf_bytes_compilation_service.get_pdf_bytes_from_markdown`.
- Frontmatter fields: `title`, `summary`, `contacts` (list of `{display, link}`), each with an optional `*_bold` boolean. Read via `backend.model.utils.markdown_file_reader`. Template resolution differs frozen (PyInstaller) vs dev — see `Resume.get_latex_template_file_path()`.
- CORS restricted to known frontend origins: `http://localhost:1420` / `http://127.0.0.1:1420` (Vite dev), `tauri://localhost` and `https://tauri.localhost` (Tauri webview, Linux).

## Frontend

```sh
cd frontend/resumecompiler
npm install
npm run dev         # Vite :1420 (strictPort)
npm run build       # tsc && vite build
npm run tauri dev   # Tauri desktop (dev, runs Vite + sidecar)
npm run tauri build # Tauri desktop (release)
```

- Frontend backend routing is Tauri-only and dynamic: `ApiClient` (`src/client/apiClient.ts`) invokes `get_backend_port`, then polls `GET /health` (exponential backoff) before using other endpoints. In a plain browser (`npm run dev` without Tauri) the API is unusable — it throws "Backend API is only available in Tauri mode".
- Tauri CSP disabled (`"csp": null` in `tauri.conf.json`). Offline PDF preview requires backend; no mock script.
- Frontend `.gitignore` covers Node/IDE/OS artifacts; root `.gitignore` covers `.pypirc`, PyInstaller artifacts (`*.spec`, `dist/`, `build/`), and `files/*`.

## Tauri sidecar architecture

- `tauri.conf.json` declares `externalBin: ["binaries/backend"]`. At runtime Tauri spawns the PyInstaller-built binary with `--port <random-free-port>`, reads stderr for logs, and exposes the port to the frontend via `get_backend_port` Tauri command (`src-tauri/src/lib.rs`).
- Sidecar binary placed at `src-tauri/binaries/backend-<target-triple>` (built by CI, not committed — gitignored in `src-tauri/.gitignore`).
- **Dev-mode gotcha:** `npm run tauri dev` silently logs "Sidecar binary not found (dev mode)" and spawns no backend if no sidecar is staged. Build one locally via `npm run build-sidecar` (→ `scripts/build_sidecar.sh`, uses `venv/bin/pyinstaller`, multiline `--add-data` separators work on macOS) or copy a CI-built `dist/backend`.

## CI / Release

- `.github/workflows/release.yml`: triggered by `v*` tag push or manual `workflow_dispatch`. macOS-only (matrix: `aarch64-apple-darwin`, `x86_64-apple-darwin`).
- Builds the Python sidecar with `pyinstaller --onefile --collect-submodules uvicorn --add-data backend/model/resources/template.tex:<target>/` using `backend/run.py` as entrypoint, stages it at `src-tauri/binaries/backend-<target>`, then `npm run tauri build` (DMG + app).
- `backend/build.spec` is the local PyInstaller spec for reference (root `backend.spec` also exists; both are gitignored via `*.spec`).

## Markdown quirks

- `^` prefix on H1/H2 hides the heading and *everything until the next H1/H2* (section scope); `^` prefix on `<li>` hides that line. Handled in `_remove_hidden_tags()` (`backend/model/transpilables/resume.py`).
- Every H2 must be immediately followed by an indented code block (`<pre><code>`). Its line count decides the achievement flavor: 2 lines → `threePartAchievement`/"toolset", 3 lines → `fourPartAchievement`/organisational. Body is otherwise only H1 (title), `<ul>` (list items restrict to `<b>`/`<i>` tags) and plain `<p>` (comments, ignored).
- Full syntax details: `docs/ResumeSyntaxGuide.md`.

## No tooling

- **No tests** (no test files, no test script in `package.json`).
- **No linter, no formatter, no pre-commit hook configured.**
- `docs/` contains design specs for deeper reference.
