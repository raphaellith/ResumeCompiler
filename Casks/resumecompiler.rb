cask "resumecompiler" do
  version "1.0.0"
  sha256 arm:   "PLACEHOLDER_UPDATED_BY_CI",
         intel: "PLACEHOLDER_UPDATED_BY_CI"

  url arm:   "https://github.com/raphaelli/ResumeCompiler/releases/download/v#{version}/resumecompiler_#{version}_aarch64.dmg",
      intel: "https://github.com/raphaelli/ResumeCompiler/releases/download/v#{version}/resumecompiler_#{version}_x64.dmg"

  name "ResumeCompiler"
  desc "Markdown to PDF resume builder"
  homepage "https://github.com/raphaelli/ResumeCompiler"

  livecheck do
    url :url
    strategy :github_latest
  end

  app "resumecompiler.app"
end
