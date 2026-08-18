from xml.etree import ElementTree
from abc import ABC, abstractmethod


class Transpilable(ABC):
    def __init__(self):
        """
        Initializes a Transpilable, the abstract base class for resume parts that are compilable to LaTeX and XML.
        """
        pass

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
