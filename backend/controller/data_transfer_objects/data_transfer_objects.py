from pydantic import BaseModel


class MarkdownInput(BaseModel):
    markdown: str
