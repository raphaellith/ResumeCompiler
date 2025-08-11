from abc import ABC, abstractmethod

class ResumeComponent(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def to_latex_lines(self) -> list[str]:
        pass