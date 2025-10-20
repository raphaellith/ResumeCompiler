from resumecompiler.Enums.Font import Font
from resumecompiler import ResumeCompiler

# To run the compiler with live reload
compiler = ResumeCompiler("example-src", "example-dist")
compiler.run_with_live_reload(font=Font.TIMES_NEW_ROMAN)