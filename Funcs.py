import markdown
from bs4 import BeautifulSoup
from bs4.element import Tag


def strip_strings(strings: list[str]):
    """
    :param strings: A list of strings.
    :return: A list of strings that have been stripped. Strings that contain only whitespaces are removed.
    """
    result = []

    for s in strings:
        stripped = s.strip()
        if len(stripped):
            result.append(stripped)

    return result


def get_soup_from_markdown(markdown_contents: str) -> BeautifulSoup:
    html = markdown.markdown(markdown_contents)
    return BeautifulSoup(html, "html.parser")


def get_children_tags(tag: Tag):
    return [child for child in tag.children if isinstance(child, Tag)]


def take_fixed_num_of_inputs(inputs: list[str], n: int):
    """
    :param inputs: A list of input strings.
    :param n: The number of input strings to accept.
    :return: A list of n strings.
    If len(inputs) < n, the original list is padded until its length is n.
    If len(inputs) == n, the original list is returned with no changes made.
    If len(inputs) > n, a list containing the first n strings in the original list is returned.
    """

    return [inputs[i] if i < len(inputs) else "" for i in range(n)]


def classify_tags_in_organisational_or_toolset_section_by_resume_item(tags: list[Tag]) -> list[list[Tag]]:
    i = 0
    num_of_tags = len(tags)
    tags_by_resume_item: list[list[Tag]] = []

    while i < num_of_tags:
        if tags[i].name == "h3":
            tags_by_resume_item.append([tags[i]])
        else:
            tags_by_resume_item[-1].append(tags[i])
        i += 1

    return tags_by_resume_item
