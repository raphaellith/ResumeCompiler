# Frontend Functional Specification

This document describes the functional behaviour of the Resume Compiler frontend. The frontend is a React 19 single-page application with a split-pane layout: a Markdown editor on the left and a PDF preview on the right, with a toolbar above both panes.


## 1. Basic layout

1. The frontend consists of a window with two side-by-side panes.
2. The left pane is the Markdown editor. The right pane is the PDF preview.
3. A toolbar containing a collection of buttons is located above the panes.
4. A resizable handle sits between the two panes, allowing the user to adjust the split ratio.


## 2. Editor pane

1. The editor pane contains a Monaco text editor for editing Markdown source code.
2. The editor pane is initially empty and disabled. It becomes enabled only when a file is selected via the "Select File" button.
3. Changes made to the editor contents are automatically saved to the Markdown file from which they were originally loaded.
4. The editor supports insertion (Tab) and deletion (Shift + Tab) of tabs, with a tab size of 4 spaces.
5. The editor supports font size adjustments via keyboard shortcuts:
   - Increase Font Size: Ctrl/Cmd + Plus.
   - Decrease Font Size: Ctrl/Cmd + Minus.
   - Reset Font Size: Ctrl/Cmd + 0.
6. The default font size is 12px. The minimum is 8px and the maximum is 24px.


## 3. PDF preview pane

1. The PDF preview pane displays the compiled PDF output of the Markdown code in the editor pane.
2. The PDF preview pane is initially empty. It becomes populated with the compiled PDF output when a file is selected and compiled successfully.
3. When no compilation has occurred, a centred placeholder message is displayed.
4. If compilation fails, the pane displays a compilation error message.


## 4. Toolbar

### 4A. Select File button

1. The "Select File" button is always enabled.
2. Clicking it opens a file picker dialog filtered to Markdown (`.md`) files.
3. When a file is selected, its contents are loaded into the editor pane and immediately compiled once.
4. In a Tauri environment, the native file dialog is used. In a browser environment, a hidden `<input type="file">` element is used as fallback.


### 4B. Compile button

1. The "Compile" button is initially disabled. It becomes enabled when a file is loaded into the editor pane.
2. Clicking it sends the current Markdown content to the backend's `/pdf/` endpoint for compilation.
3. While a compilation request is in flight, the button text changes to "Compiling..." and the button is disabled.
4. Upon success, the PDF preview pane is updated with the compiled output.


### 4C. Export dropdown

1. The "Export" button is styled with a dropdown arrow indicator. It is a dropdown menu button.
2. The button is initially disabled. It becomes enabled when a PDF has been successfully compiled and is available for preview.
3. Clicking the button opens a dropdown menu with export options.
4. The dropdown closes on item selection, clicking outside the menu, or pressing Escape.


### 4D. Export PDF menu item

1. The "Export PDF" menu item is the primary export action.
2. When clicked, the frontend prompts the user to download the compiled PDF as a file.
3. In a Tauri environment, a native save dialog is used. In a browser environment, a standard download link is triggered.


### 4E. Export XML menu item

1. The "Export XML" menu item is a secondary export action.
2. When clicked, the frontend sends the current Markdown content to the backend's `/xml/` endpoint.
3. Upon receiving the XML response, the frontend prompts the user to download the XML file.
4. In a Tauri environment, a native save dialog is used. In a browser environment, a standard download link is triggered.


### 4F. Settings button

1. The settings button is styled with a gear icon.
2. Clicking it opens the Settings modal, which allows the user to select the font used for PDF compilation.
3. It is always enabled.


## 5. Settings modal

1. The Settings modal is an MUI `Dialog` overlay with the title "Settings".
2. It contains a single font selector control: a labelled dropdown with one option per supported font.
3. The available font options are defined in `src/config/font.ts` and include: Times New Roman, Computer Modern, Fira Sans, Roboto, Noto Sans, Source Sans Pro, Cormorant Garamond, and Charter.
4. When the dialog opens, the currently selected font is pre-populated in the dropdown.
5. "Save" confirms the selection and closes the dialog. The new font is used for subsequent compilations.
6. "Cancel" or clicking outside the dialog closes it without changing the font.


## 6. Pane resize interaction

1. A resizable handle is positioned between the editor pane and the PDF preview pane.
2. The handle responds to mouse drag events.
3. On mousedown, a full-viewport overlay is created to capture mouse events and prevent text selection during drag.
4. On mousemove, the horizontal position delta is computed and applied to the left pane width.
5. On mouseup, event listeners are cleaned up and the overlay is removed.
6. The left pane width is clamped between a minimum of 200px and the available container width minus the handle width and the minimum pane width.
7. On initial render, the panes are split equally.


## 7. Hooks

### 7A. useMarkdownDocument

1. `useMarkdownDocument` manages the Markdown source file state.
2. It tracks `markdown` (the file content), `filePath` (the path of the loaded file), and derives `hasFile` and `fileDisplayName`.
3. `openFilePicker()` opens a Tauri native file dialog filtered to `.md` files and loads the selected file.
4. `loadFile(file)` reads a browser `File` object and sets state.
5. `updateMarkdown(next)` updates the editor content in state.
6. An auto-save effect writes changes back to the source file with a 300ms debounce. Only absolute file paths (Tauri) trigger auto-save; relative paths (browser File API) are skipped to avoid permission errors.


### 7B. usePdfCompilation

1. `usePdfCompilation` manages the PDF compilation lifecycle.
2. It tracks `pdfUrl` (object URL for the compiled PDF blob), `pdfBlob` (raw bytes), `isCompiling` (request in flight), `lastCompiledAt` (timestamp), and `compileError` (error message on failure).
3. `compilePdf(source, font?)` POSTs `{"markdown": source}` to the backend `/pdf/` endpoint with an optional `?font=` query parameter.
4. On success, a blob URL is created and previous blob URLs are revoked to prevent memory leaks.
5. On error, the response body is read as the error message.
6. Blob URLs are cleaned up on unmount.


### 7C. useXmlExport

1. `useXmlExport` manages the XML export lifecycle.
2. It tracks `isExportingXml` (request in flight) and `xmlError` (error message on failure).
3. `exportXml(markdown)` POSTs `{"markdown": source}` to the backend `/xml/` endpoint and returns the XML string on success.
4. On error, the error message is stored and the exception is re-thrown.


### 7D. useSaveMarkdownOnClose

1. `useSaveMarkdownOnClose` provides a best-effort safety net for saving the Markdown file when the user closes the application.
2. It registers a `beforeunload` listener on the browser window and, in Tauri, an `onCloseRequested` handler on the Tauri window.
3. Both handlers write the current Markdown content to the source file path.
4. Only absolute file paths are written. Relative paths (browser only) are skipped.
