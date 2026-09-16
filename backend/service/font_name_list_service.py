from backend.model.enums.font import Font


def get_valid_font_names():
    return [font.value for font in Font]


def get_default_font_name():
    return Font.get_default_font()
