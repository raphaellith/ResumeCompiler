# Backend Controller Specification

This document describes the HTTP controller layer of the Resume Compiler backend. The controller is a FastAPI application that exposes two REST endpoints for compiling Markdown résumés into PDF documents and XML representations.

## 1. POST /pdf/

### 1A. Request format

1. The endpoint accepts `POST` requests with `Content-Type: application/json`.
2. The request body must conform to the `MarkdownInput` Pydantic schema: `{"markdown": "<string>"}`.

### 1B. Query parameters

1. An optional `?font=` query parameter selects the typeface for the compiled PDF.
2. The value is a kebab-case string (e.g. `times-new-roman`, `fira-sans`).
3. Parameter resolution uses `Font.from_query_parameter()`. Unrecognised or omitted values default to `times-new-roman`.
4. Accepted values are: `times-new-roman`, `computer-modern`, `fira-sans`, `roboto`, `noto-sans`, `source-sans-pro`, `cormorant-garamond`, `charter`.

### 1C. Response format

1. A successful compilation returns `200 OK` with `Content-Type: application/pdf`.
2. The response body contains the raw PDF bytes.

### 1D. Error responses

1. `422 Unprocessable Entity` is returned when the request body does not match the `MarkdownInput` schema.
2. `500 Internal Server Error` is returned when:
   - `pdflatex` is not found on `$PATH`.
   - LaTeX compilation fails.
   - The PDF output file is not produced after compilation.

## 2. POST /xml/

### 2A. Request format

1. The endpoint accepts `POST` requests with `Content-Type: application/json`.
2. The request body follows the same `MarkdownInput` schema as `/pdf/`.

### 2B. Response format

1. A successful conversion returns `200 OK` with `Content-Type: application/xml`.
2. The response body is an XML string representing the parsed `Resume` component tree.

### 2C. Error responses

1. `422 Unprocessable Entity` is returned for invalid request bodies.
2. No query parameters are accepted.

## 3. CORS configuration

1. CORS middleware is configured with `allow_origins=["*"]`, `allow_methods=["*"]`, and `allow_headers=["*"]`.
2. This permissive configuration is acceptable for local-only use. Credentials are not shared (no `allow_credentials`).

## 4. Service delegation

1. The controller delegates all business logic to the service layer.
2. `POST /pdf/` calls `get_pdf_bytes_from_markdown(markdown, font)` from `markdown_to_pdf_bytes_compilation_service.py`.
3. `POST /xml/` calls `get_resume_as_xml_from_markdown(markdown)` from `markdown_to_xml_string_compilation_service.py`.
4. Exceptions from the service layer (primarily `RuntimeError`) propagate as `500 Internal Server Error`.

## 5. Data transfer objects

1. `MarkdownInput` is defined in `backend/controller/data_transfer_objects/data_transfer_objects.py`.
2. It is a Pydantic `BaseModel` with a single required field: `markdown: str`.
3. It is used as the request body schema for both endpoints.
