from abc import ABC

from backend.model.resume_components.resume_component import ResumeComponent


# TODO: Refactor - Add ResumeSectionWithItems class from which ToolsetSection and OrganisationalSection inherit?
class ResumeSection(ResumeComponent, ABC):
    def __init__(self, heading: str):
        super().__init__()

        self.heading = heading
