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
