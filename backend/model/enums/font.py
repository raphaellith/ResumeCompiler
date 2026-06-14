from __future__ import annotations

from enum import Enum


class Font(Enum):
    COMPUTER_MODERN = ""
    TIMES_NEW_ROMAN = r"\usepackage{mathptmx}"
    FIRA_SANS = r"\usepackage[sfdefault]{FiraSans}"
    ROBOTO = r"\usepackage[sfdefault]{roboto}"
    NOTO_SANS = r"\usepackage[sfdefault]{noto-sans}"
    SOURCE_SANS_PRO = r"\usepackage[default]{sourcesanspro}"
    CORMORANT_GARAMOND = r"\usepackage{CormorantGaramond}"
    CHARTER = r"\usepackage{charter}"

    @classmethod
    def from_query_parameter(cls, value: str | None) -> Font:
        mapping = {
            "times-new-roman": cls.TIMES_NEW_ROMAN,
            "computer-modern": cls.COMPUTER_MODERN,
            "fira-sans": cls.FIRA_SANS,
            "roboto": cls.ROBOTO,
            "noto-sans": cls.NOTO_SANS,
            "source-sans-pro": cls.SOURCE_SANS_PRO,
            "cormorant-garamond": cls.CORMORANT_GARAMOND,
            "charter": cls.CHARTER,
        }
        return mapping.get(value, cls.TIMES_NEW_ROMAN)