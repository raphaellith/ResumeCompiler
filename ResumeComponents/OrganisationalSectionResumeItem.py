from bs4 import Tag

from Funcs import take_fixed_num_of_inputs
from LatexFuncs import get_latex_command, replace_hyphens_with_en_dashes, indent_lines
from ResumeComponents.ResumeItem import ResumeItem


class OrganisationalSectionResumeItem(ResumeItem):
    def __init__(self, tags: list[Tag]):
        subheading_tag = tags[0]
        pre_block_tag = tags[1]
        description_list_tag = tags[2] if len(tags) > 2 else None

        super().__init__(subheading_tag=subheading_tag, description_list_tag=description_list_tag)

        # Parse preformatted block as exactly three pieces of auxiliary information
        # If more than three are provided, only the first three pieces of information are accepted as input
        # If less than three are provided, we pad them with empty strings

        num_of_auxiliary_info = 3
        pre_block_lines = pre_block_tag.text.split("\n", maxsplit=num_of_auxiliary_info)

        self.first_row_right, self.second_row_left, self.second_row_right = take_fixed_num_of_inputs(pre_block_lines, num_of_auxiliary_info)

        self.first_row_right = replace_hyphens_with_en_dashes(self.first_row_right)
        self.second_row_right = replace_hyphens_with_en_dashes(self.second_row_right)

    def to_latex_lines(self) -> list[str]:
        result = []

        # Resume subheading with auxiliary info
        result.append(
            get_latex_command(
                command="resumeItemSubheading",
                arguments=[self.subheading, self.first_row_right, self.second_row_left, self.second_row_right]
            )
        )

        if len(self.description_list) > 0:
            result.append("")
            result += self.get_description_list_as_latex_lines()

        return result