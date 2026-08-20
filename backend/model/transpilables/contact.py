from typing import Optional
from xml.etree import ElementTree

from backend.model.transpilables.transpilable import Transpilable


class Contact(Transpilable):
    def __init__(self, display: str, link: Optional[str] = None):
        """
        Creates a contact with display text and an optional hyperlink.
        :param display: The contact display text.
        :param link: The contact hyperlink, or None.
        """
        super().__init__()
        self.display: str = display
        self.link: Optional[str] = link

    def to_latex(self) -> str:
        """
        Converts the contact to LaTeX, including the hyperlink if present.
        :return: The LaTeX code representation of this contact.
        """
        display_as_latex = Transpilable.escape_for_latex(self.display)

        if not self.link:
            return display_as_latex

        link_as_latex = Transpilable.escape_for_latex(self.link)
        return r"\href{" + display_as_latex + r"}{\underline{" + link_as_latex + "}}"

    def to_xml_element(self) -> ElementTree.Element:
        """
        Builds an XML element representing this contact.
        :return: A <contact> element with the display text and an optional link attribute.
        """
        contact_element = ElementTree.Element("contact")
        contact_element.text = self.display

        if self.link:
            contact_element.set("link", self.link)

        return contact_element
