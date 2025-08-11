from bs4.element import Tag

from ResumeComponents.CatalogueSection import CatalogueSection
from ResumeComponents.ResumeComponent import ResumeComponent
from ResumeComponents.OrganisationalSection import OrganisationalSection
from ResumeComponents.Title import Title
from ResumeComponents.ContactList import ContactList
from ResumeComponents.ResumeSection import ResumeSection
from ResumeComponents.ToolsetSection import ToolsetSection
from Funcs.HtmlFuncs import get_soup_from_markdown, get_children_tags


class Resume(ResumeComponent):
    def __init__(self, markdown_contents: str):
        super().__init__()

        soup = get_soup_from_markdown(markdown_contents)
        tags = get_children_tags(soup)

        num_of_tags = len(tags)

        # Classify tags by section
        i = 0
        tags_prior_to_first_section: list[Tag] = []
        tags_by_section: list[list[Tag]] = []

        while i < num_of_tags and tags[i].name != "h2":
            tags_prior_to_first_section.append(tags[i])
            i += 1

        while i < num_of_tags:
            if tags[i].name == "h2":
                tags_by_section.append([tags[i]])
            else:
                tags_by_section[-1].append(tags[i])
            i += 1

        # Parse components
        self.components: list[ResumeComponent] = []

        for tag in tags_prior_to_first_section:
            if tag.name == "h1":  # Title
                self.components.append(Title(tag))
            elif tag.name == "ul":  # Contact list
                self.components.append(ContactList(tag))

        for tags_in_section in tags_by_section:
            self.components.append(self.get_resume_section_from_tags(tags_in_section))

    def get_resume_section_from_tags(self, tags: list[Tag]) -> ResumeSection:
        # Identify the section type
        heading = tags[0].text

        if len(heading) > 0 and heading[0] == "!":
            return ToolsetSection(tags)
        elif any(map(lambda t: t.name == "h3", tags)):
            return OrganisationalSection(tags)
        else:
            return CatalogueSection(tags)

    def to_latex_lines(self) -> list[str]:
        result: list[str] = []

        with open("resources/preamble.tex", "r") as preamble_file:
            while True:
                line = preamble_file.readline()
                if not line:
                    break
                result.append(line.removesuffix('\n'))

        result.append("")

        result.append(r"\begin{document}")

        for component in self.components:
            result += component.to_latex_lines()
            for _ in range(3):
                result.append("")

        result.append(r"\end{document}")

        return result