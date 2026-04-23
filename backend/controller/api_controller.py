from fastapi import FastAPI, Response
from pydantic import BaseModel

from backend.service.markdown_to_pdf_bytes_compilation_service import get_pdf_bytes_from_markdown


class MarkdownInput(BaseModel):
    markdown: str

app = FastAPI()

@app.post("/compile/", response_class=Response)
def compile_markdown_to_pdf(payload: MarkdownInput):
    markdown = payload.markdown
    pdf_bytes = get_pdf_bytes_from_markdown(markdown)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
    )
