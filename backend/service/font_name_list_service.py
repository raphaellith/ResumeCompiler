from backend.model.enums.font import Font


def get_valid_font_names():
    return [font.value for font in Font]
