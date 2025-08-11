import os
from os.path import isfile, join, splitext, getmtime, basename
from pathlib import Path
import subprocess
from subprocess import DEVNULL

from ResumeComponents.Resume import Resume


class ResumeCompiler:
    def __init__(self, src_dir_path, dist_dir_path):
        self.src_dir = src_dir_path
        self.dist_dir = dist_dir_path

        # Last time files are saved
        # Key: Source file path
        # Value: Last modification time since the epoch (rounded)
        self.last_modification_timestamps: dict[str, int] = dict()

    def get_paths_to_markdown_files_in_src_dir(self):
        result = []

        for directory_item in os.listdir(self.src_dir):
            # Ignore non-markdown files
            src_file_extension = splitext(directory_item)[1]

            if src_file_extension == ".md":
                src_file_path = join(self.src_dir, directory_item)
                result.append(src_file_path)

        return result

    def compile(self, src_file_path):
        src_file_name = splitext(basename(src_file_path))[0]


        try:
            # Read markdown file
            with open(src_file_path, "r", encoding="utf-8") as markdown_file:
                resume = Resume(markdown_file.read())

            # Compile md to tex
            latex_result = "\n".join(resume.to_latex_lines())
        except IndexError as e:
            print("MARKDOWN TO LATEX COMPILATION FAILED. ERROR:", e)
            return

        # Create and write to destination file located in a subdirectory of the same name
        dest_file_path = Path(self.dist_dir, src_file_name, src_file_name + ".tex")

        # Create parent directories if they don't exist
        dest_file_path.parent.mkdir(parents=True, exist_ok=True)

        # Write content to the file
        dest_file_path.write_text(latex_result)

        # Change our working directory to where the destination tex file was created, then compile it to pdf
        current_working_directory = dest_file_path.parent.as_posix()

        process = subprocess.Popen(
            ['pdflatex', dest_file_path.name],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.DEVNULL,
            text=True,
            cwd=current_working_directory
        )

        # Capture and print the output
        stdout, stderr = process.communicate()

        # Print the output for debugging
        if stdout:
            print(stdout)
        if stderr:
            print(stderr)

        # subprocess.call(["pdflatex", "-interaction=batchmode", dest_file_path.name], )

        # print(f"MARKDOWN TO LATEX TO PDF COMPILATION COMPLETE: Compiled {src_file_path} into {dest_file_path}")

    def run(self):
        for src_file_path in self.get_paths_to_markdown_files_in_src_dir():
            self.compile(src_file_path)

    def run_with_live_reload(self):
        while True:
            for src_file_path in self.get_paths_to_markdown_files_in_src_dir():
                last_mod_timestamp_recorded = self.last_modification_timestamps.get(src_file_path, -1)
                last_mod_timestamp_of_file = round(getmtime(src_file_path))

                if last_mod_timestamp_of_file == last_mod_timestamp_recorded:
                    continue

                self.last_modification_timestamps[src_file_path] = last_mod_timestamp_of_file
                self.compile(src_file_path)


if __name__ == '__main__':
    compiler = ResumeCompiler("src", "dist")
    compiler.run_with_live_reload()

