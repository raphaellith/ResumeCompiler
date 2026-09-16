# Backend Controller Specification

This document describes the HTTP controller layer of the Résumé Compiler backend. The controller is a FastAPI application that exposes four REST endpoints: a readiness check, a font-name listing, PDF compilation, and XML representation.

The controller delegates all business logic to the service layer.

CORS middleware is configured with `allow_origins` taken from `backend/controller/allowed_origins.py`:

- `http://localhost:1420` — Vite dev server (localhost)
- `http://127.0.0.1:1420` — Vite dev server (127.0.0.1)
- `tauri://localhost` — Tauri webview
- `https://tauri.localhost` — Tauri webview (Linux)

`allow_methods=["*"]` and `allow_headers=["*"]` are set, and `allow_credentials` is not set.

A global exception handler (`@app.exception_handler(Exception)`) catches any unhandled exception and returns `500 Internal Server Error` with a JSON body:

```json
{"error": "<exception-class-name>", "message": "<str(exc)>"}
```

CORS headers are re-applied to that error response for the allowed origins.


## 1. GET /health

1. Returns `200 OK` with `Content-Type: application/json` and body `{"status": "ok"}`.
2. The frontend polls this endpoint to determine when the backend is ready before issuing any other request.


## 2. GET /font-names

1. Returns `200 OK` with `Content-Type: application/json` and body `{"names": [...], "default": "..."}`.
2. `names` lists the display names of all supported fonts, sourced from the `Font` enum values (`backend/service/font_name_list_service.py`).
3. `default` is the name of the default font, `"Times New Roman"`.
4. The frontend uses this endpoint at startup to populate the font selector.


## 3. POST /pdf

1. The `/pdf` endpoint accepts `POST` requests with `Content-Type: application/json`. The request body must conform to the `MarkdownInput` Pydantic schema: `{"markdown": "<string>"}`.

2. An optional `?font=` query parameter selects the typeface for the compiled PDF. The value is a kebab-case string corresponding to a supported font, resolved using `Font.from_query_parameter()`. Recognised values are:
   - `computer-modern`
   - `times-new-roman` (default, for unrecognised or omitted values)
   - `fira-sans`
   - `roboto`
   - `noto-sans`
   - `source-sans-pro`
   - `cormorant-garamond`
   - `charter`

3. A successful compilation returns `200 OK` with `Content-Type: application/pdf`. The response body contains the raw PDF bytes.

4. `422 Unprocessable Entity` is returned when the request body does not match the `MarkdownInput` schema.

5. The global exception handler may raise `500 Internal Server Error` as follows.
   - When `pdflatex` is not found on `$PATH`, the service raises `PdfLatexNotFoundError` with body `{"error": "PdfLatexNotFoundError", "message": "Could not find 'pdflatex'..."}`.
   - When LaTeX compilation fails or no PDF output file is produced, the service raises a `RuntimeError`.
   - When the Markdown has invalid frontmatter or an invalid body structure, the error body reports the specific `Exception` class and message (e.g. `ValueError`, `TypeError`, `KeyError`).


## 4. POST /xml

1. The `/xml` endpoint accepts `POST` requests with `Content-Type: application/json`. The request body must conform to the `MarkdownInput` Pydantic schema: `{"markdown": "<string>"}`.

2. A successful conversion returns `200 OK` with `Content-Type: application/xml`. The response body is an XML string representing the parsed `Resume` component tree.

3. `422 Unprocessable Entity` is returned for invalid request bodies.

4. `500 Internal Server Error` is returned for the same frontmatter and body-structure errors described for `/pdf`.
