from typing import Optional

from fastapi import FastAPI, Query, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.controller.allowed_origins import ALLOWED_ORIGINS
from backend.controller.data_transfer_objects.data_transfer_objects import (
    MarkdownInput,
    HealthResponse,
    FontNamesResponse,
)
from backend.controller.utils import _get_error_response
from backend.model.enums.font import Font
from backend.service.font_name_list_service import get_valid_font_names
from backend.service.markdown_to_pdf_bytes_compilation_service import get_pdf_bytes_from_markdown
from backend.service.markdown_to_xml_string_compilation_service import get_resume_as_xml_from_markdown

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse()


@app.get("/font-names", response_class=Response)
def list_all_valid_font_names() -> FontNamesResponse:
    return FontNamesResponse(
        names=get_valid_font_names()
    )


@app.post("/pdf", response_class=Response)
def compile_markdown_to_pdf(payload: MarkdownInput,
                            font: Optional[str] = Query(default=None, alias="font")) -> Response:
    markdown = payload.markdown
    pdf_bytes = get_pdf_bytes_from_markdown(markdown, Font.from_query_parameter(font))

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
    )


@app.post("/xml", response_class=Response)
def compile_markdown_to_xml(payload: MarkdownInput) -> Response:
    markdown = payload.markdown
    xml_string = get_resume_as_xml_from_markdown(markdown)

    return Response(
        content=xml_string,
        media_type="application/xml",
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return _get_error_response(request, exc)
