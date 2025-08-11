import markdown
from bs4 import BeautifulSoup
from bs4.element import Tag


def get_soup_from_markdown(markdown_contents: str) -> BeautifulSoup:
    html = markdown.markdown(markdown_contents)
    return BeautifulSoup(html, "html.parser")


def get_children_tags(tag: Tag):
    return [child for child in tag.children if isinstance(child, Tag)]

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