from bs4.element import Tag
from typing import Optional

from ResumeComponents.ResumeComponent import ResumeComponent
from Funcs.HtmlFuncs import get_children_tags
from Funcs.LatexFuncs import indent_lines, get_latex_command


class ResumeItem(ResumeComponent):
    def __init__(self, subheading_tag: Tag, description_list_tag: Optional[Tag]):
        super().__init__()
        self.subheading = subheading_tag.text
        self.description_list = [item.text for item in get_children_tags(description_list_tag)] if description_list_tag else []

    def get_description_list_as_latex_lines(self) -> list[str]:
        result = []

        result.append(get_latex_command("resumeDescriptionListStart"))

        result += indent_lines(
            [get_latex_command("resumeDescriptionListItem", desc_list_item) for desc_list_item in self.description_list]
        )

        result.append(get_latex_command("resumeDescriptionListEnd"))

        return result