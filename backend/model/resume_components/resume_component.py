from xml.etree import ElementTree
from abc import ABC, abstractmethod

class ResumeComponent(ABC):
    def __init__(self):
        """
        A ResumeComponent is an abstract base class that defines the interface of any part of a resume that can be compiled to LaTeX.
        """
        pass

    @abstractmethod
    def to_latex_lines(self) -> list[str]:
        """
        :return: The LaTeX code representation of this resume component.
        """
        pass

    @abstractmethod
    def to_xml_element(self) -> ElementTree.Element:
        """
        :return: The XML representation of this resume component.
        """
        pass

    def to_xml_string(self) -> str:
        xml_element = self.to_xml_element()
        ElementTree.indent(xml_element, space="  ")
        return ElementTree.tostring(xml_element, encoding="unicode")