from xml.etree import ElementTree

from backend.model.resume_components.resume_component import ResumeComponent
from backend.model.utils.latex_utils import get_latex_command


class ContactListItem(ResumeComponent):
    def __init__(self, li_tag):
        """
        :param li_tag: The li tag corresponding to this contact list item.

        Attributes:
        self.displayed_text: The displayed textual representation of the contact list item.
        self.link: The hyperlink associated with this contact list item. Set to None if there is no such link.
        """
        super().__init__()

        hyperlink = li_tag.find("a", href=True)  # Returns first <a> tag only; returns None if no hyperlink found
        if hyperlink:
            self.displayed_text = hyperlink.text
            self.link = hyperlink.get("href")
        else:
            self.displayed_text = li_tag.text
            self.link = None

    def to_latex_lines(self) -> list[str]:
        if not self.link:
            return [self.displayed_text]

        return [
            get_latex_command(
                command="href",
                arguments=[self.link, get_latex_command(command="underline", arguments=[self.displayed_text])]
            )
        ]

    def to_xml_element(self) -> ElementTree.Element:
        contact_list_item_element = ElementTree.Element("contact-list-item")
        contact_list_item_element.text = self.displayed_text

        if self.link:
            contact_list_item_element.set("href", self.link)

        return contact_list_item_element
