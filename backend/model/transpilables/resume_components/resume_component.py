from abc import ABC

from backend.model.transpilables.transpilable import Transpilable


class ResumeComponent(Transpilable, ABC):
    def __init__(self):
        """
        Initializes a ResumeComponent, the abstract base class for all resume components.
        """
        super().__init__()
