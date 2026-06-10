from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.service.markdown_to_pdf_bytes_compilation_service import get_pdf_bytes_from_markdown
from backend.service.markdown_to_xml_string_compilation_service import get_resume_as_xml_from_markdown


class MarkdownInput(BaseModel):
    markdown: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/pdf/", response_class=Response)
def compile_markdown_to_pdf(payload: MarkdownInput):
    markdown = payload.markdown
    pdf_bytes = get_pdf_bytes_from_markdown(markdown)

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