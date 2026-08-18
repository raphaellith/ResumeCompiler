from abc import ABC
from typing import Any, cast, Union
from xml.etree import ElementTree

from bs4.element import Tag

from backend.model.transpilables.transpilable import Transpilable


class Achievement(Transpilable, ABC):
    def __init__(self, parts: Union[tuple[str, str, str], tuple[str, str, str, str]]):
        super().__init__()
        self.parts = parts

    @staticmethod
    def get_from_tags(tags: list[Tag]) -> Any:
        h2_tag: Tag = next(filter(lambda tag: tag.name == "h2", tags))
        pre_tag: Tag = next(filter(lambda tag: tag.name == "pre", tags))

        parts: list[str] = [h2_tag.text] + [line.removeprefix("^") for line in pre_tag.text.splitlines()]

        if len(parts) == 3:
            return ThreePartAchievement(
                cast(tuple[str, str, str], tuple(parts))
            )

        if len(parts) == 4:
            return FourPartAchievement(
                cast(tuple[str, str, str, str], tuple(parts))
            )

        raise ValueError("Neither three or four part achievement.")

    def get_xml_element_containing_all_parts(self, container_element_name: str, part_element_name: str = "part"):
        container_element = ElementTree.Element(container_element_name)

        for part in self.parts:
            part_element = ElementTree.SubElement(container_element, part_element_name)
            part_element.text = part

        return container_element


class ThreePartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str]):
        super().__init__(parts)

    def to_latex(self) -> str:
        return r"\threePartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        return self.get_xml_element_containing_all_parts(container_element_name="three-part-achievement")


class FourPartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str, str]):
        super().__init__(parts)

    def to_latex(self) -> str:
        return r"\fourPartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        return self.get_xml_element_containing_all_parts(container_element_name="four-part-achievement")
