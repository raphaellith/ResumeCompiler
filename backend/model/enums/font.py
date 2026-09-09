from __future__ import annotations

from enum import Enum
import re
from typing import Optional


class Font(Enum):
    COMPUTER_MODERN = "Computer Modern"
    TIMES_NEW_ROMAN = "Times New Roman"
    FIRA_SANS = "Fira Sans"
    ROBOTO = "Roboto"
    NOTO_SANS = "Noto Sans"
    SOURCE_SANS_PRO = "Source Sans Pro"
    CORMORANT_GARAMOND = "Cormorant Garamond"
    CHARTER = "Charter"

    @property
    def get_latex_import(self) -> str:
        _map = {
            "Computer Modern": "",
            "Times New Roman": r"\usepackage{mathptmx}",
            "Fira Sans": r"\usepackage[sfdefault]{FiraSans}",
            "Roboto": r"\usepackage[sfdefault]{roboto}",
            "Noto Sans": r"\usepackage[sfdefault]{noto-sans}",
            "Source Sans Pro": r"\usepackage[default]{sourcesanspro}",
            "Cormorant Garamond": r"\usepackage{CormorantGaramond}",
            "Charter": r"\usepackage{charter}"
        }
        return _map.get(self.value)

    @property
    def as_query_parameter(self) -> str:
        return re.sub(r"\s+", "-", self.value.lower())

    @classmethod
    def from_query_parameter(cls, query_parameter: Optional[str]) -> Font:
        """
        Resolves a kebab-case font query parameter to a Font enum member.
        :param query_parameter: The kebab-case query parameter containing the font name, or None.
        :return: The matching Font member; defaults to TIMES_NEW_ROMAN when unknown or None.
        """
        for font in cls:
            if font.as_query_parameter == query_parameter:
                return font

        return cls.TIMES_NEW_ROMAN

    @classmethod
    def get_default_font(cls) -> Font:
        return cls.TIMES_NEW_ROMAN
