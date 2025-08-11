from bs4 import Tag

from Funcs.Funcs import take_fixed_num_of_inputs
from Funcs.LatexFuncs import get_latex_command, replace_hyphens_with_en_dashes, indent_lines
from ResumeComponents.ResumeItem import ResumeItem


class ToolsetSectionResumeItem(ResumeItem):
    def __init__(self, tags: list[Tag]):
        subheading_tag = tags[0]
        pre_block_tag = tags[1]
        description_list_tag = tags[2] if len(tags) > 2 else None

        super().__init__(subheading_tag=subheading_tag, description_list_tag=description_list_tag)

        # Two pieces of auxiliary info - tools and time
        # If more than two are provided, only the first two pieces of information are accepted as input
        # If less than two are provided, we pad them with empty strings
        num_of_auxiliary_info = 2
        pre_block_lines = pre_block_tag.text.split("\n", maxsplit=num_of_auxiliary_info)

        self.tools, self.time = take_fixed_num_of_inputs(pre_block_lines, num_of_auxiliary_info)

    def to_latex_lines(self) -> list[str]:
        result = []

        # Resume subheading with toolset and time
        result.append(
                get_latex_command(
                command="resumeItemSubheadingWithToolset",
                arguments=[
                    get_latex_command(command="textbf", arguments=self.subheading) + " $|$ " + get_latex_command(command="emph", arguments=self.tools),
                    replace_hyphens_with_en_dashes(self.time)
                ]
            )
        )

        if len(self.description_list) > 0:
            result.append("")
            result += self.get_description_list_as_latex_lines()

        return result
