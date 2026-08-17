from abc import ABC
from typing import Any, cast
from xml.etree import ElementTree

from bs4.element import Tag

from backend.model.transpilables.transpilable import Transpilable


class Achievement(Transpilable, ABC):
    def __init__(self):
        super().__init__()

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


class ThreePartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str]):
        super().__init__()
        self.parts = parts

    def to_latex(self) -> str:
        return r"\threePartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        pass


class FourPartAchievement(Achievement):
    def __init__(self, parts: tuple[str, str, str, str]):
        super().__init__()
        self.parts = parts

    def to_latex(self) -> str:
        return r"\fourPartAchievement" + "".join(map(lambda s: "{" + s + "}", self.parts))

    def to_xml_element(self) -> ElementTree.Element:
        pass
