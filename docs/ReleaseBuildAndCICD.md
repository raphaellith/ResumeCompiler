# Release Build & CI/CD Design

## Overview

Two-process architecture retained for production. Python backend is frozen into a
standalone executable (sidecar) via PyInstaller and bundled inside the Tauri
application package. LaTeX (`pdflatex`) is **not** bundled — detected at runtime.

## Sidecar Architecture

```
┌─────────────────────────────────┐
│  Tauri Desktop Shell (Rust)     │
│  ├─ WebView (React SPA)         │
│  ├─ Sidecar (Python binary)     │  ← random port
│  │    └─ FastAPI :{random_port} │
│  └─ Shell plugin (spawn/kill)   │
└─────────────────────────────────┘
```

- **Rust** (`src-tauri/src/lib.rs`): On `setup()`, binds a `TcpListener` to
  `127.0.0.1:0` to get a random free port, then spawns the Python binary via
  `tauri_plugin_shell::ShellExt::sidecar("backend")` passing `--port {port}`.
  The `SidecarState` struct (Tauri-managed state) stores the port and child
  handle; on `Drop` the child is killed.
- **Plugins**: `tauri_plugin_shell` (sidecar spawn), plus `tauri_plugin_dialog`,
  `tauri_plugin_fs`, and `tauri_plugin_opener` for the frontend. The capability
  file (`src-tauri/capabilities/default.json`) grants the main window
  `shell:default`, `dialog:allow-open`, `dialog:allow-save`, and
  recursive home read/write via the fs plugin.
- **Python** (`backend/run.py`): Command-line entrypoint that parses `--port`
  and starts `uvicorn` on that port. Defaults to `8000` when run standalone.
- **Frontend** (`src/client/apiClient.ts`): Calls `invoke("get_backend_port")` to
  retrieve the dynamic port in Tauri mode, then polls `GET /health` (exponential
  backoff 50 ms → 500 ms) until it returns `200 OK` before using other backend
  endpoints.
- **Dev mode**: The sidecar binary won't exist at `src-tauri/binaries/` during
  development unless built first. `lib.rs` logs "Sidecar binary not found (dev mode)"
  and the frontend requires a valid dynamic sidecar port — there is no fixed-URL
  fallback.

## LaTeX Detection

LaTeX is not bundled (hundreds of MB, platform-specific). Detection:

1. `backend/service/markdown_to_pdf_bytes_compilation_service.py` — the
   `_run_pdflatex()` function catches `FileNotFoundError` (and `OSError` messages
   containing "not found" / "no such file") and raises `PdfLatexNotFoundError`
   (`backend/service/errors/pdf_latex_not_found_error.py`).
2. `backend/controller/api_controller.py` — the global exception handler returns
   `HTTP 500` with JSON body `{"error": "PdfLatexNotFoundError", "message": "Could not find 'pdflatex'..."}`.
3. `src/client/apiClient.ts` — turns a non-OK response into
   `Error("PdfLatexNotFoundError: Could not find 'pdflatex'…")` by parsing the
   response's `error`/`message` fields.
4. `src/hooks/usePdfCompilation.ts` — stores the message in `compileError`.
5. `src/components/CompilationErrorMessage/` — renders the message verbatim in a
   styled error banner. There is no special-cased sentinel or OS-specific install
   instructions in the current implementation.

## Port Negotiation

Port is dynamically allocated to avoid conflicts:

1. Rust binds `TcpListener` to `127.0.0.1:0` → OS assigns a free port.
2. Port is passed as CLI argument `--port {port}` to the sidecar.
3. Port is stored in Tauri-managed state and exposed via `get_backend_port`
   command.
4. Frontend calls the command on startup and caches the resulting base URL.

## Bundle Configuration

- `src-tauri/tauri.conf.json`: `bundle.externalBin` lists `["binaries/backend"]`;
  `bundle.targets` is `["dmg", "app"]`.
- Sidecar binaries are placed at `src-tauri/binaries/backend-{target-triple}` by
  CI, matching Tauri's naming convention.
- `macOS.signingIdentity: "-"` — builds are ad-hoc signed (no Apple Developer
  account required for distribution; users bypass Gatekeeper via
  right-click → Open or `xattr -c`).
- CSP is disabled (`"csp": null`) — offline PDF preview requires the backend at a
  localhost port.

## CI/CD Pipeline

File: `.github/workflows/release.yml`

**Trigger**: Push of a tag matching `v*` (e.g. `v1.0.0`) or manual
`workflow_dispatch`.

**Matrix** (macOS only):

| Runner | Target triple | Bundle |
|---|---|---|
| `macos-latest` | `aarch64-apple-darwin` | `.dmg` + `.app` |

**Per-platform steps**:
1. Checkout, then setup Python 3.12 (`actions/setup-python@v5`, pip cache)
2. `pip install -r requirements.txt pyinstaller`
3. Build the sidecar with
   `pyinstaller --onefile --name backend --add-data "backend/model/resources/template.tex:backend/model/resources/" --collect-submodules uvicorn backend/run.py`
4. Copy the binary to `src-tauri/binaries/backend-{target}` (`dist/backend`)
5. Setup Node 22 (`actions/setup-node@v4`, npm cache) and run `npm ci`
6. Setup the Rust toolchain and the target via `dtolnay/rust-toolchain@stable`; cache with `swatinem/rust-cache@v2`
7. `npm run tauri build` with `TARGET={target}` env
8. Upload the `.dmg` and `.app` from `src-tauri/target/release/bundle/` as a build artifact

**Post-matrix**: A `create-release` job (on `ubuntu-latest`, `needs: build`,
`github.ref_type == 'tag'`) downloads all artifacts and creates a GitHub Release
with generated release notes (`softprops/action-gh-release@v2`).

> Note: Windows builds are not part of the CI matrix; the shipped binaries are
> macOS-only.

## PyInstaller Configuration

- Entrypoint: `backend/run.py`
- Hidden imports: all `uvicorn.*` submodules via `--collect-submodules uvicorn`
- Data files: `backend/model/resources/template.tex` → bundled at
  `backend/model/resources/template.tex` relative to the bundle root (resolved via
  `sys._MEIPASS` when frozen — see `Resume.get_latex_template_file_path()`, which
  also handles the dev/frozen distinction)
- One-file executable mode (`--onefile`), console attached (`--console` in
  `scripts/build_sidecar.sh`)
- Local dev builds use `npm run build-sidecar` → `scripts/build_sidecar.sh`
  (PyInstaller from `venv/bin/pyinstaller`, stages
  `frontend/resumecompiler/src-tauri/binaries/backend-<target-triple>`).
  `backend/build.spec` is the reference PyInstaller spec (gitignored via `*.spec`).

## Key Files

| File | Purpose |
|---|---|
| `backend/run.py` | PyInstaller entrypoint, parses `--port` |
| `backend/build.spec` | PyInstaller spec file reference (local builds) |
| `scripts/build_sidecar.sh` | Local sidecar build + staging script |
| `backend/service/errors/pdf_latex_not_found_error.py` | `pdflatex`-missing error type |
| `src-tauri/src/lib.rs` | Sidecar spawn, state, `get_backend_port` command |
| `src-tauri/tauri.conf.json` | `externalBin`, bundle targets, macOS signing skip |
| `src-tauri/capabilities/default.json` | Shell/dialog/fs permissions |
| `src/client/apiClient.ts` | Dynamic endpoint resolution, `/health` readiness poll |
| `src/services/fontService.ts` | Font list consumed from `GET /font-names` |
| `src/hooks/usePdfCompilation.ts` | PDF compilation + error propagation |
| `src/components/CompilationErrorMessage/` | Compilation error display UI |
| `.github/workflows/release.yml` | CI/CD pipeline (macOS-only) |