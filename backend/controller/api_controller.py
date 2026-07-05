from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.controller.data_transfer_objects.data_transfer_objects import MarkdownInput
from backend.model.enums.font import Font
from backend.service.markdown_to_pdf_bytes_compilation_service import (
    get_pdf_bytes_from_markdown,
    PdfLatexNotFoundError,
)
from backend.service.markdown_to_xml_string_compilation_service import get_resume_as_xml_from_markdown

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------ API ENDPOINTS ------------------------------

@app.post("/pdf/", response_class=Response)
def compile_markdown_to_pdf(
    payload: MarkdownInput,
    font: str | None = Query(default=None, alias="font"),
):
    markdown = payload.markdown

    try:
        pdf_bytes = get_pdf_bytes_from_markdown(markdown, Font.from_query_parameter(font))
    except PdfLatexNotFoundError:
        return JSONResponse(
            status_code=502,
            content={
                "error": "pdflatex_not_found",
                "message": "Could not find 'pdflatex'. Install a LaTeX distribution (e.g. MacTeX on macOS, MiKTeX on Windows).",
            },
        )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
    )


@app.post("/xml/", response_class=Response)
def compile_markdown_to_xml(payload: MarkdownInput):
    markdown = payload.markdown
    xml_string = get_resume_as_xml_from_markdown(markdown)

    return Response(
        content=xml_string,
        media_type="application/xml",
    )