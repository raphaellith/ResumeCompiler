from xml.etree import ElementTree

from backend.model.resume_components.resume_component import ResumeComponent
from backend.model.utils.latex_utils import indent_lines, get_latex_command


class ResumeItem(ResumeComponent):
    def __init__(self, subheading: str, description_list: list[str]):
        """
        :param subheading: The subheading of this resume item.
        :param description_list: The description list of this resume item.
        """
        super().__init__()
        self.subheading = subheading
        self.description_list = description_list

    def get_description_list_as_latex_lines(self) -> list[str]:
        """
        :return: The LaTeX representation of this resume item's description list.
        """
        result = [get_latex_command("resumeDescriptionListStart")]

        result += indent_lines(
            [get_latex_command("resumeDescriptionListItem", [desc_list_item]) for desc_list_item in self.description_list]
        )

        result.append(get_latex_command("resumeDescriptionListEnd"))

        return result

    def get_description_list_as_xml_element(self) -> ElementTree.Element:
        description_list_element = ElementTree.Element("description-list")

        for description in self.description_list:
            description_element = ElementTree.SubElement(description_list_element, "description")
            description_element.text = description

        return description_list_element
