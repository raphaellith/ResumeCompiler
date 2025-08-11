from bs4 import Tag

from LatexFuncs import get_latex_command, indent_lines
from ResumeComponents.ResumeComponent import ResumeComponent
from ResumeComponents.ResumeItem import ResumeItem


class ResumeSection(ResumeComponent):
    def __init__(self, heading: str):
        super().__init__()

        self.heading = heading

    # def to_latex_lines(self) -> list[str]:
    #     pass


def get_toolset_or_organisational_section_as_latex_lines(heading: str, resume_items: list[ResumeItem]) -> list[str]:
    result = []

    result.append(get_latex_command("section", heading))

    result.append(get_latex_command("resumeSubheadingListStart"))

    for resume_item in resume_items:
        result += indent_lines(resume_item.to_latex_lines())
        result.append("")

    result.append(get_latex_command("resumeSubheadingListEnd"))

    return result