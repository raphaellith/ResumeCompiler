from typing import Optional

from fastapi import FastAPI, Query, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.controller.data_transfer_objects.data_transfer_objects import MarkdownInput, HealthResponse
from backend.model.enums.font import Font
from backend.service.markdown_to_pdf_bytes_compilation_service import get_pdf_bytes_from_markdown
from backend.service.markdown_to_xml_string_compilation_service import get_resume_as_xml_from_markdown

ALLOWED_ORIGINS = [
    "http://localhost:1420",    # Vite dev server (localhost)
    "http://127.0.0.1:1420",    # Vite dev server (127.0.0.1)
    "tauri://localhost",        # Tauri webview
    "https://tauri.localhost",  # Tauri webview (Linux)
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error_response(request: Request, exc: Exception) -> JSONResponse:
    error_type = type(exc).__name__
    error_message = str(exc)

    response = JSONResponse(
        status_code=500,
        content={
            "error": error_type,
            "message": error_message,
        },
    )
    _add_cors_headers_to_response(response, request)

    return response


def _add_cors_headers_to_response(response: JSONResponse, request: Request):
    origin = request.headers.get("origin")
    if origin not in ALLOWED_ORIGINS:
        return

    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return _error_response(request, exc)


# ------------------------------ API ENDPOINTS ------------------------------

@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse()


@app.post("/pdf/", response_class=Response)
def compile_markdown_to_pdf(payload: MarkdownInput,
                            font: Optional[str] = Query(default=None, alias="font")) -> Response:
    markdown = payload.markdown
    pdf_bytes = get_pdf_bytes_from_markdown(markdown, Font.from_query_parameter(font))

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
    )


@app.post("/xml/", response_class=Response)
def compile_markdown_to_xml(payload: MarkdownInput) -> Response:
    markdown = payload.markdown
    xml_string = get_resume_as_xml_from_markdown(markdown)

    return Response(
        content=xml_string,
        media_type="application/xml",
    )
