from ResumeCompiler import ResumeCompiler
from Enums.Font import Font

compiler = ResumeCompiler("src", "dist")
compiler.run_with_live_reload(font=Font.TIMES_NEW_ROMAN)