from xml.etree import ElementTree

from bs4 import Tag

from backend.model.transpilables.resume_components.resume_component import ResumeComponent
from backend.model.transpilables.transpilable import Transpilable


class Heading(ResumeComponent):
    def __init__(self, h1_tag: Tag):
        """
        Initializes a Heading component from an h1 tag.
        :param h1_tag: The h1 tag containing the heading text.
        """
        super().__init__()
        self.text = h1_tag.text

    def to_latex(self) -> str:
        """
        Converts the heading to a LaTeX \\section command.
        :return: The LaTeX code representation of this heading.
        """
        return r"\section{" + Transpilable.escape_for_latex(self.text) + "}"

    def to_xml_element(self) -> ElementTree.Element:
        """
        Builds an XML element representing this heading.
        :return: A <heading> element whose text is the heading text.
        """
        heading_element = ElementTree.Element("heading")
        heading_element.text = self.text
        return heading_element
