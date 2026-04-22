from bs4.element import Tag

from backend.model.resume_components.contact_lists.contact_list_item import ContactListItem
from backend.model.resume_components.resume_component import ResumeComponent
from backend.model.utils.latex_utils import get_latex_environment


class ContactList(ResumeComponent):
    def __init__(self, ul_tag: Tag):
        """
        :param ul_tag: The unordered list tag that represents this contact list.
        """
        super().__init__()

        self.contacts: list[ContactListItem] = [ContactListItem(li_tag) for li_tag in ul_tag.find_all("li")]

    def to_latex_lines(self) -> list[str]:
        centered_lines: list[str] = [r"\small"]

        num_of_contact_list_items = len(self.contacts)
        for i, contact_list_item in enumerate(self.contacts):
            centered_lines += contact_list_item.to_latex_lines()

            if i != num_of_contact_list_items - 1:
                centered_lines.append(r"$|$")

        return get_latex_environment(env="center", contents=centered_lines)