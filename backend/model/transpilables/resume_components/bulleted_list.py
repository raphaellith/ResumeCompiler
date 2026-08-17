from xml.etree import ElementTree

from bs4.element import Tag, PageElement, NavigableString

from backend.model.transpilables.resume_components.resume_component import ResumeComponent


class BulletedList(ResumeComponent):
    def __init__(self, ul_tag: Tag):
        super().__init__()
        self.li_tags: list[Tag] = ul_tag.find_all("li")

    def to_latex(self) -> str:
        def get_page_element_as_latex(element: PageElement) -> str:
            if isinstance(element, NavigableString):
                return element.string

            if isinstance(element, Tag):
                if element.name == "b":
                    return r"\textbf{" + "".join(map(get_page_element_as_latex, element.contents)) + "}"
                if element.name == "i":
                    return r"\textit{" + "".join(map(get_page_element_as_latex, element.contents)) + "}"
                raise ValueError(f"List item contains {element.name} tag; only <b> and <i> allowed.")

            raise ValueError("List item contains page element that is neither a navigable string nor a tag.")

        result = r"\begin{itemize}[leftmargin=12pt, itemsep=-2pt]" + "\n"
        for li_tag in self.li_tags:
            result += r"\item "
            for li_tag_content in li_tag.contents:
                result += get_page_element_as_latex(li_tag_content)
            result += "\n"
        result += r"\end{itemize}\vspace{0.3em}"

        return result

    def to_xml_element(self) -> ElementTree.Element:
        # TODO
        pass
