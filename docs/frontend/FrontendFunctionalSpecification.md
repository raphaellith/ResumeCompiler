# Frontend Functional Specification

This document describes the functional behaviour of the Résumé Compiler frontend. The frontend is a single-page React application with a split-pane layout: a Markdown editor on the left and a PDF preview on the right, with a multi-button toolbar above both panes. A resizable handle sits between the two panes, allowing the user to adjust the split ratio.

The frontend is Tauri-only in practice: all backend requests route through `ApiClient` (`src/client/apiClient.ts`), which resolves the backend port dynamically and requires a Tauri runtime.


## 1. Editor pane

1. The editor pane contains a Monaco text editor for editing Markdown source code.

2. The editor pane is initially empty and read-only. It becomes editable only when a file is selected via the "Select File" button; until then a read-only hint "Select a file to edit." is shown.

3. Changes made to the editor contents are automatically saved to the Markdown file from which they were originally loaded, debounced by 300 ms. Only absolute file paths (Tauri) trigger auto-save; relative paths (browser `File` API) are skipped to avoid permission errors.

4. The editor supports insertion (Tab) and deletion (Shift + Tab) of tabs, with a tab size of 4 spaces in insert-spaces mode.

5. The editor supports font size adjustments via keyboard shortcuts:
   - Increase Font Size: Ctrl/Cmd + Plus.
   - Decrease Font Size: Ctrl/Cmd + Minus.
   - Reset Font Size: Ctrl/Cmd + 0.

6. The default font size is 12px. The minimum is 8px and the maximum is 24px. The step size is 2px.

7. The pane header shows "Editor" and, once a file is loaded, the file's display name.


## 2. PDF preview pane

1. The PDF preview pane displays the compiled PDF output of the Markdown code in the editor pane.

2. The PDF preview pane is initially empty. It becomes populated with the compiled PDF output when a file is selected and compiled successfully.

3. When no compilation has occurred, a centred placeholder is displayed ("No preview available... Select a Markdown file for compilation.").

4. If compilation fails, the pane displays a compilation error message below the preview area.


## 3. Backend initialisation

1. On startup the app calls `ApiClient.ensureBackendIsReady()`, which polls `GET /health` until it returns `200 OK`. Polling starts at 50 ms and doubles up to a 500 ms cap.

2. Once ready, the app fetches font information from `GET /font-names` via `FontService`, including both the list of available fonts and the default font ("Times New Roman").

3. Until the backend is ready, the Compile and Export controls are disabled and an `BackendStatusThrobber` is shown in the toolbar. If initialisation fails, a backend error is recorded, which disables the Settings modal.


## 4. Toolbar

### 4A. Select File button

1. The "Select File" button is always enabled.

2. Clicking it opens a file picker dialog filtered to Markdown (`.md`) files.

3. When a file is selected, its contents are loaded into the editor pane and immediately compiled once.

4. In a Tauri environment, the native file dialog is used. In a browser environment, the Tauri call falls back to a hidden `<input type="file">` element.


### 4B. Compile button

1. The "Compile" button is disabled until the backend is ready, a file is loaded into the editor pane, and no compilation is already in flight.

2. Clicking it sends the current Markdown content, along with the font query parameter currently selected in Settings, to the backend's `/pdf` endpoint for compilation.

3. While a compilation request is in flight the button stays labelled "Compile" but is disabled; there is no separate "Compiling…" state. The toolbar's `BackendStatusThrobber` spinner indicates backend readiness, not compilation activity.

4. Upon success, the PDF preview pane is updated with the compiled output.


### 4C. Export dropdown

1. The "Export" button is styled with a dropdown arrow indicator. It is a dropdown menu button.

2. The button is disabled when the backend is not ready or no PDF has been compiled.

3. Clicking it opens a dropdown menu with two options: "Export PDF" and "Export XML".

4. The dropdown closes on item selection, on clicking outside the menu, or on pressing Escape.

5. Both menu items are individually disabled until a PDF has been successfully compiled. Exporting XML is gated on the compiled PDF too, since both share the same preview state.


### 4D. Export PDF menu item

1. The "Export PDF" menu item is the primary export action.

2. The proposed filename is the loaded file's name with its extension stripped (falling back to `resume`) plus `.pdf`.

3. In a Tauri environment, a native save dialog is used. In a browser environment, a standard download link is triggered.


### 4E. Export XML menu item

1. The "Export XML" menu item is a secondary export action.

2. When clicked, the frontend sends the current Markdown content to the backend's `/xml` endpoint.

3. The proposed filename is the loaded file's name with its extension stripped (falling back to `resume`) plus `.xml`.

4. In a Tauri environment, a native save dialog is used. In a browser environment, a standard download link is triggered.


### 4F. Settings button

1. The settings button is disabled only while the font list is loading or font loading failed (backend error).

2. Clicking it opens the Settings modal, which allows the user to select the font used for PDF compilation.


## 5. Settings modal

1. The Settings modal is an MUI `Dialog` overlay with the title "Settings".

2. It contains a single font selector control: a labelled dropdown with one option per supported font. It shows "Loading fonts..." while fetching, or the font error otherwise.

3. The available font options are fetched at runtime from the backend's `GET /font-names` endpoint rather than hard-coded. The backend currently serves: Computer Modern, Times New Roman, Fira Sans, Roboto, Noto Sans, Source Sans Pro, Cormorant Garamond, Charter.

4. The default font — initially selected — is the backend's reported default, Times New Roman.

5. Whenever the dialog opens, the currently selected font is pre-populated in the dropdown.

6. "Save" confirms the selection and closes the dialog. The new font (as a kebab-case query parameter, e.g. `times-new-roman`) is used for subsequent compilations.

7. "Cancel" or clicking outside the dialog closes it without changing the font.


## 6. Pane resize interaction

1. A resizable handle is positioned between the editor pane and the PDF preview pane.

2. The handle responds to mouse drag events.
   - On mousedown, a full-viewport overlay is created to capture mouse events and prevent text selection during drag.
   - On mousemove, the horizontal position delta is computed and applied to the left pane width.
   - On mouseup, event listeners are cleaned up and the overlay is removed.

3. The left pane width is clamped between a minimum of 200px and the available container width minus the handle width and the minimum pane width.

4. On initial render, the panes are split equally.


## 7. API client

1. `ApiClient` (`src/client/apiClient.ts`) is the single access point for backend HTTP calls. All methods are static and cache the resolved base URL and readiness state across calls.

2. `resolveApiBaseUrl()` throws `"Backend API is only available in Tauri mode"` in a plain browser. In Tauri, it invokes the `get_backend_port` command to obtain the sidecar's dynamic port and validates it is a positive integer, then caches `http://127.0.0.1:{port}`.

3. `ensureBackendIsReady()` polls `GET /health` with exponential backoff (50 ms → 500 ms) until the endpoint responds `OK`.

4. `getResponseFromEndpoint()` awaits backend readiness, builds the endpoint URL with optional query string, `fetch`es it, and — on a non-OK response — parses the JSON body and throws `Error("<error-type>: <message>")`.

5. Dedicated helpers exist for each endpoint: `getResponseFromPostRequestToPdfEndpoint(markdown, font?)`, `getResponseFromPostRequestToXmlEndpoint(markdown)`, and `getResponseFromGetRequestToFontNamesEndpoint()`.


## 8. Hooks

### 8A. useMarkdownDocument

1. `useMarkdownDocument` manages the Markdown source file state. It tracks the file content `markdown` and the `filePath`, and derives `hasFile` and `fileDisplayName`.

2. `openFilePicker()` opens the Tauri native file dialog filtered to `.md` files and, on selection, reads the file via `readTextFile` and updates state. It returns the loaded `{markdown, filePath}` or `null` when cancelled. It throws in a plain browser, and the caller falls back to the hidden file input.

3. `loadFile(file)` reads a browser `File` object (its `path` when exposed by Tauri's file input, else its bare name), updates state, and returns the loaded `{markdown, filePath}`.

4. `updateMarkdown(next)` updates the editor content in state.

5. An auto-save effect writes changes back to the source file with a 300 ms debounce. Only absolute file paths trigger auto-save; relative paths (browser `File` API) are skipped to avoid permission errors.


### 8B. usePdfCompilation

1. `usePdfCompilation` manages the PDF compilation lifecycle. It tracks `pdfUrl` (object URL for the compiled PDF blob), `pdfBlob` (raw bytes), `isCompiling` (request in flight), `lastCompiledAt` (timestamp), and `compileError` (error message on failure).

2. `compilePdf(source, fontQueryParam?)` POSTs `{"markdown": source}` to the backend `/pdf` endpoint with an optional `?font=` query parameter.
   - On success, a blob URL is created and the previous blob URL is revoked to prevent memory leaks. The latest blob URL is revoked again on unmount.
   - On error, the message is taken from the thrown `Error` (formed as `"<error-type>: <message>"` by `ApiClient`) and stored in `compileError`; the message is also logged with `console.error`.

3. There is no special-cased "pdflatex missing" sentinel: a missing LaTeX distribution surfaces as `"PdfLatexNotFoundError: Could not find 'pdflatex'…"` and is rendered verbatim by `CompilationErrorMessage`.


### 8C. useXmlExport

1. `useXmlExport` manages the XML export lifecycle. It tracks `isExportingXml` (request in flight) and `xmlError` (error message on failure).

2. `exportXml(markdown)` POSTs `{"markdown": markdown}` to the backend `/xml` endpoint and returns the XML string on success. On error, the error message is stored and the exception is re-thrown.


### 8D. useSaveMarkdownOnClose

1. `useSaveMarkdownOnClose` provides a best-effort safety net for saving the Markdown file when the user closes the application. It registers a `beforeunload` listener on the browser window and, in Tauri, an `onCloseRequested` handler on the Tauri window (obtained via a dynamic import of `@tauri-apps/api/window`). Both handlers write the current Markdown content to the source file path.

2. Only absolute file paths are written. Relative paths (browser only) are skipped.