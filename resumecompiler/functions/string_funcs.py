def strip_strings(strings: list[str]) -> list[str]:
    """
    :param strings: A list of strings.
    :return: A list of strings that have been stripped. Strings that contain only whitespaces are removed.
    """

    return list(filter(lambda s: s, map(str.strip, strings)))
