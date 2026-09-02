from pydantic import BaseModel


class MarkdownInput(BaseModel):
    markdown: str


class HealthResponse(BaseModel):
    status: str = "ok"
