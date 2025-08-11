from bs4 import Tag

from ResumeComponents.ResumeItem import ResumeItem
from ResumeComponents.OrganisationalSectionResumeItem import OrganisationalSectionResumeItem
from ResumeComponents.ResumeSection import ResumeSection, get_toolset_or_organisational_section_as_latex_lines
from Funcs.HtmlFuncs import classify_tags_in_organisational_or_toolset_section_by_resume_item
from Funcs.LatexFuncs import indent_lines, get_latex_command


class OrganisationalSection(ResumeSection):
    def __init__(self, tags: list[Tag]):
        heading = tags[0].text

        super().__init__(heading=heading)

        tags_by_resume_item = classify_tags_in_organisational_or_toolset_section_by_resume_item(tags[1:])

        # Initialise resume items
        self.resume_items: list[ResumeItem] = [OrganisationalSectionResumeItem(tags_for_resume_item) for tags_for_resume_item in tags_by_resume_item]

    def to_latex_lines(self) -> list[str]:
        return get_toolset_or_organisational_section_as_latex_lines(heading=self.heading, resume_items=self.resume_items)