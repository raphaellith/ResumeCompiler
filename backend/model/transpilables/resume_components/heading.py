from xml.etree import ElementTree

from bs4 import Tag

from backend.model.transpilables.resume_components.resume_component import ResumeComponent


class Heading(ResumeComponent):
    def __init__(self, h1_tag: Tag):
        """
        :param h1_tag: The h1 tag representing this heading
        """
        super().__init__()
        self.text = h1_tag.text

    def to_latex(self) -> str:
        return r"\section{" + self.text + r"}"

    def to_xml_element(self) -> ElementTree.Element:
        heading_element = ElementTree.Element("heading")
        heading_element.text = self.text
        return heading_element
