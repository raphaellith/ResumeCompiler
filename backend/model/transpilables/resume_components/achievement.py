from abc import ABC
from typing import Any, cast, Union
from xml.etree import ElementTree

from bs4.element import Tag

from backend.model.transpilables.transpilable import Transpilable


class Achievement(Transpilable, ABC):
    def __init__(self, parts: Union[tuple[str, str, str], tuple[str, str, str, str]]):
        super().__init__()
        self.parts = parts

    @classmethod
    def get_from_tags(cls, tags: list[Tag]) -> Any:
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
    
    def get_xml_element_containing_all_parts(self, name_for_container_element: str, name_for_part_elements: str = "part"):
        container_element = ElementTree.Element(name_for_container_element)

        for part in self.parts:
            part_element = ElementTree.SubElement(container_element, name_for_part_elements)
            part_element.text = part

        return container_element


class ThreePartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str]):
        super().__init__(parts)

    def to_latex(self) -> str:
        return r"\threePartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        return self.get_xml_element_containing_all_parts(name_for_container_element="three-part-achievement")


class FourPartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str, str]):
        super().__init__(parts)

    def to_latex(self) -> str:
        return r"\fourPartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        return self.get_xml_element_containing_all_parts(name_for_container_element="four-part-achievement")
