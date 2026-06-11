from xml.etree import ElementTree

from bs4.element import Tag

from backend.model.resume_components.resume_sections.resume_section import ResumeSection
from backend.model.utils.latex_utils import get_latex_command, indent_lines
from backend.model.resume_components.resume_items.resume_item import ResumeItem


def get_toolset_or_organisational_section_as_latex_lines(heading: str, resume_items: list[ResumeItem]) -> list[str]:
    """
    :param heading: The heading of the toolset or organisational section.
    :param resume_items: The list of resume items belonging to the toolset or organisational section.
    :return: The LaTeX representation of the resume section.
    """
    result = [
        get_latex_command("section", [heading]),
        get_latex_command("resumeSubheadingListStart")
    ]

    for resume_item in resume_items:
        result += indent_lines(resume_item.to_latex_lines())
        result.append("")

    result.append(get_latex_command("resumeSubheadingListEnd"))

    return result


def get_toolset_or_organisational_section_as_xml_element(section: ResumeSection, is_toolset_section: bool) -> ElementTree.Element:
    """
    :param section: The toolset or organisational section.
    :param is_toolset_section: Whether the section is a toolset or organisational section.
    :return: The XML representation of the toolset or organisational section.
    """
    tag = "toolset-section" if is_toolset_section else "organisational-section"

    section_element = ElementTree.Element(tag)
    section_element.set("heading", section.heading)

    section_element.extend(map(lambda item: item.to_xml_element(), section.resume_items))

    return section_element


def classify_tags_in_toolset_or_organisation_section_by_resume_item(tags: list[Tag]) -> list[list[Tag]]:
    """
    :param tags: A list of tags representing a series of resume items in a toolset or organisational section.
    :return: A two-dimensional list of tags, with each sublist containing the tags that belong to a resume item.
    """

    i = 0
    num_of_tags = len(tags)
    tags_by_resume_item: list[list[Tag]] = []

    while i < num_of_tags:
        if tags[i].name == "h3":
            tags_by_resume_item.append([tags[i]])
        else:
            tags_by_resume_item[-1].append(tags[i])
        i += 1

    return tags_by_resume_item
