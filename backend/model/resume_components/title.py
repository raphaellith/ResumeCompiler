from bs4.element import Tag

from backend.model.resume_components.resume_component import ResumeComponent
from backend.model.utils.latex_utils import get_latex_environment, get_latex_command


class Title(ResumeComponent):
    def __init__(self, h1_tag: Tag):
        """
        :param h1_tag: The h1 HTML tag representing this title.
        """
        super().__init__()
        self.text = h1_tag.text

    def to_latex_lines(self) -> list[str]:
        return get_latex_environment(
            env="center",
            contents=[
                get_latex_command(
                    command="textbf",
                    arguments=[get_latex_command(command="huge") + " " + self.text]
                )
            ]
        )
