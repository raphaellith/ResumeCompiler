from typing import Union
import re

def indent_lines(lines: list[str]) -> list[str]:
    return ['\t' + line for line in lines]


def get_latex_command(command: str, arguments: Union[str, list[str], None] = None,
                      square_bracket_options: Union[str, list[str], None] = None) -> str:
    result = "\\" + command

    if square_bracket_options:
        result += "["
        if isinstance(square_bracket_options, str):
            result += square_bracket_options
        else:
            result += ", ".join(square_bracket_options)
        result += "]"

    if arguments:
        if isinstance(arguments, str):
            arguments = [arguments]

        result += "".join(map(lambda arg: "{" + arg + "}", arguments))

    return result


def get_latex_environment(env: str, contents: list[str]) -> list[str]:
    result = ["\\begin{" + env + "}"]
    result += indent_lines(contents)
    result += ["\\end{" + env + "}"]

    return result


def replace_hyphens_with_en_dashes(string: str) -> str:
    return re.sub(r"\s[–\-]+\s", r" -- ", string)
