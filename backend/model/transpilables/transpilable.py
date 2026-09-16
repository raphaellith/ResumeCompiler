import re
from xml.etree import ElementTree
from abc import ABC, abstractmethod


class Transpilable(ABC):
    LATEX_ESCAPE_SEQUENCES: dict[str, str] = {
        "\\": r"\textbackslash",
        r"{": r"\{",
        r"}": r"\}",
        r"$": r"\$",
        r"&": r"\&",
        r"#": r"\#",
        r"_": r"\_",
        r"^": r"\^{}",
        r"~": r"\~{}",
        r"%": r"\%"
    }

    LATEX_SPECIAL_CHARACTERS: re.Pattern = re.compile(
        "[{chars}]".format(
            chars=re.escape("".join(LATEX_ESCAPE_SEQUENCES.keys()))
        )
    )

    def __init__(self):
        """
        Initializes a Transpilable, the abstract base class for resume parts that are compilable to LaTeX and XML.
        """
        pass

    @classmethod
    def escape_for_latex(cls, string: str) -> str:
        """
        Escapes LaTeX special characters in the given string.
        :param string: The string to escape.
        :return: The escaped string.
        """
        return re.sub(
            pattern=Transpilable.LATEX_SPECIAL_CHARACTERS,
            repl=lambda match: Transpilable.LATEX_ESCAPE_SEQUENCES[match.group(0)],
            string=string
        )

    @abstractmethod
    def to_latex(self) -> str:
        """
        Renders this Transpilable as LaTeX code.
        :return: The LaTeX code representation of this Transpilable.
        """
        pass

    @abstractmethod
    def to_xml_element(self) -> ElementTree.Element:
        """
        Renders this Transpilable as an XML element.
        :return: The XML representation of this Transpilable.
        """
        pass

    def to_xml_string(self) -> str:
        """
        Serializes this Transpilable to an indented XML string.
        :return: The XML string representation of this Transpilable.
        """
        xml_element = self.to_xml_element()
        ElementTree.indent(xml_element, space="  ")
        return ElementTree.tostring(xml_element, encoding="unicode")
