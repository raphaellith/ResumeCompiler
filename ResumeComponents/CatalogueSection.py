from bs4 import Tag

from ResumeComponents.ResumeSection import ResumeSection
from Funcs import get_children_tags
from LatexFuncs import get_latex_command


class CatalogueSection(ResumeSection):
    def __init__(self, tags: list[Tag]):
        heading = tags[0].text

        super().__init__(heading=heading)

        self.list = []

        i = 1
        while i < len(tags):
            if tags[i].name == "ul":
                self.list += [list_item.text for list_item in get_children_tags(tags[i]) if list_item.name == "li"]
            i += 1

    def to_latex_lines(self) -> list[str]:
        result = []

        result.append(get_latex_command("section", self.heading))

        if len(self.list) == 0:
            return result

        result.append("")
        result.append("\\begin{itemize}[leftmargin=0.15in, label={}]\small{\item{")

        for list_item in self.list:
            list_item_split_by_colon = list_item.split(":", maxsplit=1)
            if len(list_item_split_by_colon) == 2:
                label, text = list_item_split_by_colon
                latex_line = get_latex_command(command="textbf", arguments=label) + ": " + text
            else:
                latex_line = list_item_split_by_colon[0]
            result.append("\t" + latex_line + r"\\")

        result.append(r"}}\end{itemize}")

        return result