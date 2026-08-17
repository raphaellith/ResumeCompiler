from typing import Optional

import frontmatter
import markdown
from bs4 import BeautifulSoup
from bs4.element import Tag


class MarkdownFileReader:
    def __init__(self, file_contents: str):
        self.post: frontmatter.Post = frontmatter.loads(file_contents)

    def _get_argument_from_frontmatter(self, parameter: str) -> object:
        argument: Optional[object] = self.post.get(parameter)

        if argument is None:
            raise KeyError(f"The frontmatter parameter {parameter} does not exist.")

        return argument

    def get_string_argument_from_frontmatter(self, parameter: str) -> str:
        argument: object = self._get_argument_from_frontmatter(parameter)

        if not isinstance(argument, str):
            raise KeyError(f"The frontmatter parameter {parameter} does not have a string argument.")

        return argument

    def get_boolean_argument_from_frontmatter(self, parameter: str) -> bool:
        argument: object = self._get_argument_from_frontmatter(parameter)

        if not isinstance(argument, bool):
            raise KeyError(f"The frontmatter parameter {parameter} does not have a boolean argument.")

        return argument

    def get_list_argument_from_frontmatter(self, parameter: str) -> list:
        argument: object = self._get_argument_from_frontmatter(parameter)

        if not isinstance(argument, list):
            raise KeyError(f"The frontmatter parameter {parameter} does not have a list argument.")

        return argument

    def get_soup_from_body(self) -> BeautifulSoup:
        html = markdown.markdown(self.post.content)
        return BeautifulSoup(html, features="html.parser")

    def get_tags_from_body(self) -> list[Tag]:
        soup: BeautifulSoup = self.get_soup_from_body()
        return [child for child in soup.children if isinstance(child, Tag)]
