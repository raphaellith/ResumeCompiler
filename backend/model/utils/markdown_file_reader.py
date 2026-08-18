from typing import Optional

import frontmatter
import markdown
from bs4 import BeautifulSoup
from bs4.element import Tag


class MarkdownFileReader:
    def __init__(self, file_contents: str):
        """
        Parses the YAML frontmatter and Markdown body from file contents.
        :param file_contents: The raw Markdown file contents, including frontmatter.
        """
        self.post: frontmatter.Post = frontmatter.loads(file_contents)

    def _get_argument_from_frontmatter(self, parameter: str) -> object:
        """
        Retrieves a raw frontmatter argument by parameter name.
        :param parameter: The frontmatter parameter name.
        :return: The raw argument value.
        :raises KeyError: If the parameter does not exist in the frontmatter.
        """
        argument: Optional[object] = self.post.get(parameter)

        if argument is None:
            raise KeyError(f"The frontmatter parameter {parameter} does not exist.")

        return argument

    def get_string_argument_from_frontmatter(self, parameter: str) -> str:
        """
        Retrieves a string argument from the frontmatter.
        :param parameter: The frontmatter parameter name.
        :return: The string argument value.
        :raises TypeError: If the parameter is not a string.
        """
        argument: object = self._get_argument_from_frontmatter(parameter)

        if not isinstance(argument, str):
            raise TypeError(f"The value given by the frontmatter parameter {parameter} is not a string.")

        return argument

    def get_boolean_argument_from_frontmatter(self, parameter: str) -> bool:
        """
        Retrieves a boolean argument from the frontmatter.
        :param parameter: The frontmatter parameter name.
        :return: The boolean argument value.
        :raises TypeError: If the parameter is not a boolean.
        """
        argument: object = self._get_argument_from_frontmatter(parameter)

        if not isinstance(argument, bool):
            raise TypeError(f"The value given by the frontmatter parameter {parameter} is not a boolean.")

        return argument

    def get_list_argument_from_frontmatter(self, parameter: str) -> list:
        """
        Retrieves a list argument from the frontmatter.
        :param parameter: The frontmatter parameter name.
        :return: The list argument value.
        :raises TypeError: If the parameter is not a list.
        """
        argument: object = self._get_argument_from_frontmatter(parameter)

        if not isinstance(argument, list):
            raise TypeError(f"The value given by the frontmatter parameter {parameter} is not a list.")

        return argument

    def get_soup_from_body(self) -> BeautifulSoup:
        """
        Converts the Markdown body to HTML and parses it into a BeautifulSoup object.
        :return: The parsed body as a BeautifulSoup object.
        """
        html = markdown.markdown(self.post.content)
        return BeautifulSoup(html, features="html.parser")

    def get_tags_from_body(self) -> list[Tag]:
        """
        Extracts the top-level tags from the parsed Markdown body.
        :return: A list of the body's top-level Tag objects.
        """
        soup: BeautifulSoup = self.get_soup_from_body()
        return [child for child in soup.children if isinstance(child, Tag)]
