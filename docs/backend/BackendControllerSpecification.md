# Backend Controller Specification

This document describes the HTTP controller layer of the Resume Compiler backend. The controller is a FastAPI application that exposes two REST endpoints for compiling Markdown résumés into PDF documents and XML representations.

The controller delegates all business logic to the service layer.

CORS middleware is configured with `allow_origins=["*"]`, `allow_methods=["*"]`, and `allow_headers=["*"]`. This permissive configuration is acceptable for local-only use. Credentials are not shared (no `allow_credentials`).


## 1. POST /pdf/

1. The `/pdf/` endpoint accepts `POST` requests with `Content-Type: application/json`. The request body must conform to the `MarkdownInput` Pydantic schema: `{"markdown": "<string>"}`.

2. An optional `?font=` query parameter selects the typeface for the compiled PDF. The value should be a kebab-case string corresponding to a supported font, resolved using `Font.from_query_parameter()`. Possible values include:
   - `times-new-roman` (default, for unrecognised or omitted values)
   - `computer-modern`
   - `fira-sans`
   - `roboto`
   - `noto-sans`
   - `source-sans-pro`
   - `cormorant-garamond`
   - `charter`

3. A successful compilation returns `200 OK` with `Content-Type: application/pdf`. The response body contains the raw PDF bytes.

4. `422 Unprocessable Entity` is returned when the request body does not match the `MarkdownInput` schema.

5. `500 Internal Server Error` is returned when:
   - `pdflatex` is not found on `$PATH`.
   - LaTeX compilation fails.
   - The PDF output file is not produced after compilation.


## 2. POST /xml/

### 2A. Request format

1. The endpoint accepts `POST` requests with `Content-Type: application/json`. The request body must conform to the `MarkdownInput` Pydantic schema: `{"markdown": "<string>"}`.

2. A successful conversion returns `200 OK` with `Content-Type: application/xml`. The response body is an XML string representing the parsed `Resume` component tree.

3. `422 Unprocessable Entity` is returned for invalid request bodies.

