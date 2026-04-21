from pathlib import Path

def create_and_write_file(file_path: Path, contents: str):
    """
    Creates the file (along with all intermediate directories) and writes the specified contents onto the file.
    :param file_path: A file path.
    :param contents: Contents to be written onto the file.
    :return:
    """
    # Create parent directories if they don't exist
    file_path.parent.mkdir(parents=True, exist_ok=True)

    # Write content to the file
    file_path.write_text(contents)