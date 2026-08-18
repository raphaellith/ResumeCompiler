from abc import ABC
from typing import Any, cast, Union
from xml.etree import ElementTree

from bs4.element import Tag

from backend.model.transpilables.transpilable import Transpilable


class Achievement(Transpilable, ABC):
    def __init__(self, parts: Union[tuple[str, str, str], tuple[str, str, str, str]]):
        """
        Initializes an Achievement with its text parts.
        :param parts: A tuple of three or four string parts of the achievement.
        """
        super().__init__()
        self.parts = parts

    @staticmethod
    def get_from_tags(tags: list[Tag]) -> Any:
        """
        Builds a ThreePartAchievement or FourPartAchievement from h2 and pre tags.
        :param tags: The tags representing the achievement, including one h2 and one pre tag.
        The pre tag should span 2 or 3 lines.
        :return: A ThreePartAchievement or FourPartAchievement instance.
        :raises ValueError: If the number of extracted parts is neither 3 nor 4.
        """
        h2_tag: Tag = next(filter(lambda tag: tag.name == "h2", tags))
        pre_tag: Tag = next(filter(lambda tag: tag.name == "pre", tags))

        parts: list[str] = [h2_tag.text] + [line.removeprefix("^") for line in pre_tag.text.splitlines()]
        num_of_parts = len(parts)

        if num_of_parts == 3:
            return ThreePartAchievement(
                cast(tuple[str, str, str], tuple(parts))
            )

        if num_of_parts == 4:
            return FourPartAchievement(
                cast(tuple[str, str, str, str], tuple(parts))
            )

        raise ValueError("Neither three or four part achievement.")

    def get_xml_element_containing_all_parts(self, container_element_name: str, part_element_name: str = "part"):
        """
        Builds an XML container element with one child element per part.
        :param container_element_name: The tag name of the container element.
        :param part_element_name: The tag name of each part element, defaulting to "part".
        :return: The container XML element containing the part elements.
        """
        container_element = ElementTree.Element(container_element_name)

        for part in self.parts:
            part_element = ElementTree.SubElement(container_element, part_element_name)
            part_element.text = part

        return container_element


class ThreePartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str]):
        """
        Initializes a three-part achievement.
        :param parts: The three string parts of the achievement.
        """
        super().__init__(parts)

    def to_latex(self) -> str:
        """
        Converts the achievement to a \\threePartAchievement command.
        :return: The LaTeX code representation of this achievement.
        """
        return r"\threePartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        """
        Builds an XML element representing this achievement.
        :return: A <three-part-achievement> element containing one <part> element per part.
        """
        return self.get_xml_element_containing_all_parts(container_element_name="three-part-achievement")


class FourPartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str, str]):
        """
        Initializes a four-part achievement.
        :param parts: The four string parts of the achievement.
        """
        super().__init__(parts)

    def to_latex(self) -> str:
        """
        Converts the achievement to a \\fourPartAchievement command.
        :return: The LaTeX code representation of this achievement.
        """
        return r"\fourPartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        """
        Builds an XML element representing this achievement.
        :return: A <four-part-achievement> element containing one <part> element per part.
        """
        return self.get_xml_element_containing_all_parts(container_element_name="four-part-achievement")
