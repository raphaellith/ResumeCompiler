from resumecompiler.Enums.Font import Font
from resumecompiler import ResumeCompiler

compiler = ResumeCompiler("example-src", "example-dist")
compiler.run_with_live_reload(font=Font.TIMES_NEW_ROMAN)