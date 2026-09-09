from pydantic import BaseModel


class MarkdownInput(BaseModel):
    markdown: str


class HealthResponse(BaseModel):
    status: str = "ok"


class FontNamesResponse(BaseModel):
    names: list[str]
    default: str
