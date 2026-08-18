from xml.etree import ElementTree

from bs4.element import Tag, PageElement, NavigableString

from backend.model.transpilables.resume_components.resume_component import ResumeComponent


class BulletedList(ResumeComponent):
    def __init__(self, ul_tag: Tag):
        """
        Initializes a BulletedList component from a <ul> tag.
        :param ul_tag: The <ul> tag whose <li> children make up the list items.
        """
        super().__init__()
        self.li_tags: list[Tag] = ul_tag.find_all("li")

    def to_latex(self) -> str:
        """
        Converts the bulleted list to a LaTeX itemize environment.
        :return: The LaTeX code representation of this list.
        :raises ValueError: If a list item contains a tag other than <b> or <i>.
        """

        def get_page_element_as_latex(element: PageElement) -> str:
            """
            Recursively converts a single page element to LaTeX, applying <b> and <i> formatting.
            :param element: The page element (text or tag) to convert.
            :return: The LaTeX code representation of the element.
            :raises ValueError: If the element is an unsupported tag or a non-text, non-tag element.
            """
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
        """
        Builds an XML element representing this bulleted list.
        :return: A <bulleted-list> element containing one <list-item> element per list item.
        """
        container_element = ElementTree.Element("bulleted-list")

        for li_tag in self.li_tags:
            list_item_element: ElementTree.Element = ElementTree.fromstring(li_tag.prettify(formatter="minimal"))
            list_item_element.tag = "list-item"  # Other <b> and <i> tags stay as is
            container_element.append(list_item_element)

        return container_element
