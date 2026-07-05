from xml.etree import ElementTree

from bs4 import Tag

from backend.model.resume_components.resume_items.toolset_section_resume_item import ToolsetSectionResumeItem
from backend.model.resume_components.resume_sections.resume_section import ResumeSection
from backend.model.resume_components.resume_sections.utils.toolset_and_organisational_section_utils import classify_tags_in_toolset_or_organisation_section_by_resume_item, get_toolset_or_organisational_section_as_latex_lines, get_toolset_or_organisational_section_as_xml_element


class ToolsetSection(ResumeSection):
    def __init__(self, tags: list[Tag]):
        """
        :param tags: The list of tags that belong to this toolset section.
        """
        h2_tag: Tag = tags.pop(0)
        heading: str = h2_tag.text.removeprefix("!")

        super().__init__(heading=heading)

        tags_by_resume_item: list[list[Tag]] = classify_tags_in_toolset_or_organisation_section_by_resume_item(tags)

        # Initialise resume items
        self.resume_items: list[ToolsetSectionResumeItem] = [
            ToolsetSectionResumeItem(tags_for_resume_item) for tags_for_resume_item in tags_by_resume_item
        ]

    def to_latex_lines(self) -> list[str]:
        return get_toolset_or_organisational_section_as_latex_lines(heading=self.heading, resume_items=self.resume_items)

    def to_xml_element(self) -> ElementTree.Element:
        return get_toolset_or_organisational_section_as_xml_element(self, is_toolset_section=True)
