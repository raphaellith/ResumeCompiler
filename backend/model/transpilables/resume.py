import re
import sys
from typing import Callable
from xml.etree import ElementTree

from bs4.element import Tag, NavigableString
from pathlib import Path

from backend.model.transpilables.contact import Contact
from backend.model.transpilables.resume_components.achievement import Achievement
from backend.model.transpilables.resume_components.bulleted_list import BulletedList
from backend.model.transpilables.resume_components.resume_component import ResumeComponent
from backend.model.transpilables.transpilable import Transpilable
from backend.model.transpilables.resume_components.heading import Heading
from backend.model.enums.font import Font
from backend.model.utils.markdown_file_reader import MarkdownFileReader


class Resume(Transpilable):
    PATH_TO_TEMPLATE_TEX_FILE: str = "backend/model/resources/template.tex"

    def __init__(self, markdown_file_contents: str):
        """
        Parses Markdown frontmatter and body into a Resume component tree.
        :param markdown_file_contents: The Markdown content to be compiled, including YAML-style frontmatter.
        """
        super().__init__()

        markdown_file_reader = MarkdownFileReader(markdown_file_contents)

        self.title: str = markdown_file_reader.get_string_argument_from_frontmatter("title")
        self.title_bold: bool = markdown_file_reader.get_boolean_argument_from_frontmatter("title_bold")

        self.summary: str = markdown_file_reader.get_string_argument_from_frontmatter("summary")
        self.summary_bold: bool = markdown_file_reader.get_boolean_argument_from_frontmatter("summary_bold")

        self.contacts: list[Contact] = Resume._validate_and_parse_contacts(
            markdown_file_reader.get_list_argument_from_frontmatter("contacts")
        )
        self.contacts_bold: bool = markdown_file_reader.get_boolean_argument_from_frontmatter("contacts_bold")

        self.tags: list[Tag] = markdown_file_reader.get_tags_from_body()

        self._validate_tags()
        self._remove_hidden_tags()

        self.components: list[ResumeComponent] = []
        for tag_group in self._get_tags_grouped_by_component():
            leading_tag_name = tag_group[0].name
            if leading_tag_name == "h1":
                self.components.append(Heading(tag_group[0]))
            elif leading_tag_name == "h2":
                self.components.append(Achievement.from_tags(tag_group))
            elif leading_tag_name == "ul":
                self.components.append(BulletedList(tag_group[0]))

    @staticmethod
    def _validate_and_parse_contacts(frontmatter_contacts: list) -> list[Contact]:
        """
        Validates and converts the frontmatter contacts list into Contact objects.

        The input is valid if it is a list of dicts, where each dict:
        - contains a required 'display' key whose value is a str; and
        - optionally contains a 'link' key whose value, if present, is a str.

        Any other keys in the dict are ignored.
        Each dict yields exactly one Contact whose .display is the 'display' value.
        Contact.link is set to the 'link' value only when the 'link' key is present.

        :param frontmatter_contacts: The raw list of contacts from the frontmatter.
        :return: One Contact per input dict.
        :raises TypeError: If an element is not a dict, or if a 'display' or 'link' value is not a str.
        :raises KeyError: If a dict lacks the required 'display' key.
        """
        result: list[Contact] = []

        for frontmatter_contact in frontmatter_contacts:
            if not isinstance(frontmatter_contact, dict):
                raise TypeError(f"Each entry in the 'contacts' field must be a dictionary, "
                                f"but got {type(frontmatter_contact).__name__}.")
            if "display" not in frontmatter_contact:
                raise KeyError(f"Each contact must have a 'display' field, but one entry does not: "
                               f"{frontmatter_contact.__repr__()}.")

            display = frontmatter_contact["display"]
            if not isinstance(display, str):
                raise TypeError(f"The 'display' field of a contact must be a string, but got {type(display).__name__}.")

            contact: Contact = Contact(display=display)

            if "link" in frontmatter_contact:
                link = frontmatter_contact["link"]
                if not isinstance(link, str):
                    raise TypeError(f"The 'link' field of a contact must be a string, but got {type(link).__name__}.")
                contact.link = link

            result.append(contact)

        return result

    def _validate_tags(self):
        """
        Validates the structure and allowed tags of the parsed Markdown body.

        The body's top-level tags, concatenated in document order as "<tag-name>" strings, must fully match the regular
        expression (<h1>|<ul>|<h2><pre>|<p>)*.

        Equivalently, the top-level tags must be a repetition (in any order) of: a standalone <h1>, a standalone <ul>, a
        standalone <p>, or an <h2> immediately followed by a <pre>. An <h2> can therefore only ever appear as the tag
        directly preceding a <pre>.

        Each top-level tag must additionally satisfy the following requirements.
        - h1/h2: Contains exactly one child, and that child must be a tagless text node (NavigableString).
        - ul: Every direct child must be an <li> tag and must only contain <b> and <i> tags.
        - pre: Contains exactly one child, which must be a <code> tag. That <code> must contain exactly one child,
          which is a text node (NavigableString) whose stripped text spans exactly 2 or 3 lines.

        :raises ValueError: If the concatenated top-level tag names do not match the pattern above,
                            if any tag found inside a list item is neither <b> nor <i>, or
                            if a code block's text does not span exactly 2 or 3 lines.
        :raises TypeError: If a heading does not contain exactly one text node,
                           if a <ul> has a direct child that is not an <li>, or
                           if a <pre>/<code> block does not match the required structure.
        """
        concatenated_top_level_tag_names: str = "".join([f"<{tag.name}>" for tag in self.tags])

        required_pattern_for_concatenated_top_level_tag_names: re.Pattern = re.compile(r"(<h1>|<ul>|<h2><pre>|<p>)*")
        if not re.fullmatch(required_pattern_for_concatenated_top_level_tag_names, concatenated_top_level_tag_names):
            raise ValueError(
                f"The document body is not structured correctly. It may only contain headings (<h1>), bulleted lists "
                f"(<ul>), paragraphs (<p>), and achievements (<h2> followed by a code block), but found: "
                f"{concatenated_top_level_tag_names}."
            )

        for tag in self.tags:
            if tag.name in ("h1", "h2"):
                # Must contain only one navigable string
                if not (len(tag.contents) == 1 and isinstance(tag.contents[0], NavigableString)):
                    raise TypeError(f"A heading (<h1>/<h2>) must contain exactly one plain text node and no nested "
                                    f"tags, but it contains {len(tag.contents)} node(s).")

            elif tag.name == "ul":
                if not all([isinstance(child, Tag) and child.name == "li" for child in tag.find_all(recursive=False)]):
                    raise TypeError("A list (<ul>) may only contain list items (<li>) as direct children.")

                for list_item in tag.find_all("li"):
                    tags_used_in_list_item = list_item.find_all()
                    for tag_used_in_list_item in tags_used_in_list_item:
                        if tag_used_in_list_item.name not in ("b", "i"):
                            raise ValueError(f"A list item contains a <{tag_used_in_list_item.name}> tag; only <b> "
                                             f"and <i> tags are allowed.")

            elif tag.name == "pre":
                if len(tag.contents) != 1:
                    raise TypeError("A code block (<pre>) must contain exactly one child node.")

                child_node = tag.contents[0]
                if not (isinstance(child_node, Tag) and child_node.name == "code"):
                    raise TypeError("A code block (<pre>) must contain a single <code> tag.")

                if not (len(child_node.contents) == 1 and isinstance(child_node.contents[0], NavigableString)):
                    raise TypeError("A code block (<code>) must contain exactly one text node (which may span multiple "
                                    "lines) and no nested tags.")

                num_of_lines_in_code_block = len(child_node.contents[0].text.strip().splitlines())
                if not 2 <= num_of_lines_in_code_block <= 3:
                    raise ValueError(f"A code block (<code>) must contain 2 or 3 lines of text, "
                                     f"but it contains {num_of_lines_in_code_block}.")

    def _remove_hidden_tags(self):
        """
        Removes tags whose headings or list items start with the '^' hidden marker.
        """
        result: list[Tag] = []

        # These booleans indicate, as we iterate through the following FOR loop,
        # whether we are currently in the scope of a hidden h1 or h2 heading.
        # - An h1 heading's scope starts with that heading and ends with the element
        #   immediately before the next h1 heading.
        # - An h2 heading's scope starts with that heading and ends with the element
        #   immediately before the next h1 or h2 heading.
        in_scope_of_hidden_h1: bool = False
        in_scope_of_hidden_h2: bool = False

        for tag in self.tags:
            if tag.name == "h1":
                in_scope_of_hidden_h1 = tag.text.startswith("^")
                in_scope_of_hidden_h2 = False
            elif tag.name == "h2":
                in_scope_of_hidden_h2 = tag.text.startswith("^")

            if in_scope_of_hidden_h1 or in_scope_of_hidden_h2:
                continue

            if tag.name != "ul":
                result.append(tag)
                continue

            for li_tag in tag.find_all("li"):  # For unordered lists, check for any hidden list items
                if li_tag.text.startswith("^"):
                    li_tag.extract()

            if tag.find("li"):  # If some list items still remain
                result.append(tag)

        self.tags = result

    def _get_tags_grouped_by_component(self) -> list[list[Tag]]:
        """
        Groups tags into components, where h1/h2/ul start a new component and pre blocks extend the last one.
        :return: A list of components, each a list of Tag objects.
        """
        result: list[list[Tag]] = []

        for tag in self.tags:
            if tag.name in ("h1", "h2", "ul"):  # These tags mark the start of a new component
                result.append([tag])
            elif tag.name == "pre":
                result[-1].append(tag)

        return result

    def _get_components_grouped_by_section(self) -> list[list[ResumeComponent]]:
        """
        Groups components into sections, where each starting with a Heading (except possibly for the first section).
        :return: A list of sections, each a list of ResumeComponent objects.
        """
        result: list[list[ResumeComponent]] = []

        for component in self.components:
            if isinstance(component, Heading) or not result:  # When the list is empty, we have to start a new section
                result.append([component])
            else:
                result[-1].append(component)

        return result

    def get_title_as_latex(self) -> str:
        """
        Builds the LaTeX representation of the resume title, optionally bold.
        :return: The title as a LaTeX string.
        """
        title = Transpilable.escape_for_latex(self.title)

        if self.title_bold:
            title = r"\textbf{" + title + "}"

        return r"\resumeTitle{" + title + "}"

    def get_summary_as_latex(self) -> str:
        """
        Builds the LaTeX representation of the resume summary, optionally bold.
        :return: The summary as a LaTeX string.
        """
        summary = Transpilable.escape_for_latex(self.summary)

        if self.summary_bold:
            summary = r"\textbf{" + summary + "}"

        return r"\resumeSummary{" + summary + "}"

    def get_contact_list_as_latex(self) -> str:
        """
        Builds the LaTeX representation of the contact list, linking entries that have a link.
        :return: The contact list as a LaTeX string.
        """
        result = r"\resumeContactList{" + " $|$ ".join([c.to_latex() for c in self.contacts]) + "}"

        if not self.contacts_bold:
            return result

        return r"\textbf{" + result + r"}"

    def get_document_contents_as_latex(self) -> str:
        """
        Renders each section's heading and its components into LaTeX, wrapping section contents in itemize lists.
        :return: The document body as a LaTeX string.
        """
        result = ""

        for component_group in self._get_components_grouped_by_section():
            if isinstance(component_group[0], Heading):
                heading = component_group.pop(0)
                result += heading.to_latex()
                result += "\n\n"

            if component_group:
                result += r"\begin{itemize}[leftmargin=0in, label={}, itemsep=-2pt]" + "\n"
                for component in component_group:
                    result += r"\item " + component.to_latex() + "\n"
                result += r"\end{itemize}" + "\n\n"

        return result

    @classmethod
    def get_latex_template_file_path(cls) -> Path:
        """
        Locates and returns the path to the LaTeX template file.

        Different resolution strategies are used depending on whether this is called in a dev environment or in a
        PyInstaller onefile sidecar.

        Both strategies use the same relative path and differ only in the root directory they join it against.

        - Dev (unfrozen):
          We know the backend must be run from the repository root (see the `backend.*` absolute imports).
          So the template is resolved against the current working directory.

        - Frozen (PyInstaller onefile sidecar):
          The modules are stored inside the bundled PYZ archive and are NOT extracted to disk.
          Hence, `backend/model/transpilables/` never exists as a real directory.
          Any path that must traverse through it fails with FileNotFoundError.
          The `--add-data` datas, however, ARE extracted under sys._MEIPASS preserving their relative destination
          (backend/model/resources/template.tex). We therefore resolve against sys._MEIPASS when frozen.

        `sys.frozen` is set by the PyInstaller bootloader. `sys._MEIPASS` is the temporary directory into which the
        onefile bundle is unpacked at startup.

        :return: The absolute path to the LaTeX template file.
        """

        if getattr(sys, "frozen", False):
            return Path(getattr(sys, "_MEIPASS")) / cls.PATH_TO_TEMPLATE_TEX_FILE
        else:
            return Path.cwd() / cls.PATH_TO_TEMPLATE_TEX_FILE

    def to_latex(self, font: Font = Font.TIMES_NEW_ROMAN) -> str:
        """
        Fills the LaTeX template with the resume's font, title, summary, contacts and contents.
        :param font: The font to apply to the compiled resume.
        :return: The compiled LaTeX string.
        """
        arguments: dict[str, str] = {
            "FONT_CHOICE": font.value,
            "RESUME_TITLE": self.get_title_as_latex(),
            "RESUME_SUMMARY": self.get_summary_as_latex(),
            "RESUME_CONTACT_LIST": self.get_contact_list_as_latex(),
            "RESUME_CONTENTS": self.get_document_contents_as_latex()
        }

        pattern: re.Pattern = re.compile(
            r"%\[\[(" +
            "|".join(arguments.keys()) +
            ")]]%"
        )

        replacement: Callable[[re.Match], str] = lambda m: arguments.get(m.group(1), "")

        with open(self.get_latex_template_file_path(), "r") as template_file:
            latex: str = template_file.read()

        return pattern.sub(replacement, latex)

    def get_frontmatter_as_xml_element(self) -> ElementTree.Element:
        """
        Builds the frontmatter XML element containing title, summary and contacts.
        :return: The frontmatter as an XML element.
        """
        frontmatter_element = ElementTree.Element("frontmatter")

        title_element = ElementTree.SubElement(
            frontmatter_element,
            "title",
            attrib={"bold": str(self.title_bold).lower()}
        )

        title_element.text = self.title

        summary_element = ElementTree.SubElement(
            frontmatter_element,
            "summary",
            attrib={"bold": str(self.summary_bold).lower()}
        )

        summary_element.text = self.summary

        contacts_element = ElementTree.SubElement(
            frontmatter_element,
            "contacts",
            attrib={"bold": str(self.contacts_bold).lower()}
        )

        for contact in self.contacts:
            contacts_element.append(contact.to_xml_element())

        return frontmatter_element

    def to_xml_element(self) -> ElementTree.Element:
        """
        Builds the resume XML element with frontmatter and all components.
        :return: The resume as an XML element.
        """
        resume_element = ElementTree.Element("resume")

        resume_element.append(self.get_frontmatter_as_xml_element())

        for component in self.components:
            resume_element.append(component.to_xml_element())

        return resume_element
