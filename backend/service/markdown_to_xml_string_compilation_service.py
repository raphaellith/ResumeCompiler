from backend.model.resume_components.resume import Resume


def get_resume_as_xml_from_markdown(markdown: str) -> str:
    """
    Converts Markdown code to an XML document containing the compiled resume contents.
    :param markdown: The Markdown code to be converted to XML.
    :return: The XML document containing the compiled resume contents.
    """
    resume = Resume(markdown)

    # TODO: Implement XML conversion
    pass