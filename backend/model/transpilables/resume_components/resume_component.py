from abc import ABC

from backend.model.transpilables.transpilable import Transpilable


class ResumeComponent(Transpilable, ABC):
    def __init__(self):
        super().__init__()
