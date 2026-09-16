import ButtonGroup from "@mui/material/ButtonGroup";
import { SelectFileButton } from "./SelectFileButton";
import { BackendStatusThrobber } from "./BackendStatusThrobber";
import { CompileButton } from "./CompileButton";
import { SettingsButton } from "./SettingsButton";
import { ExportDropdown } from "./ExportDropdown";
import styles from "./Toolbar.module.scss";

export type ToolbarProps = {
  hasFile: boolean;
  isCompiling: boolean;
  canExport: boolean;
  canExportXml: boolean;
  onOpenFile: () => void;
  onCompile: () => void;
  onSettings: () => void;
  onExport: () => void;
  onExportXml: () => void;
  backendReady: boolean;
  fontsLoading: boolean;
  fontError: string | null;
};

export function Toolbar({
  hasFile,
  isCompiling,
  canExport,
  canExportXml,
  onOpenFile,
  onCompile,
  onSettings,
  onExport,
  onExportXml,
  backendReady,
  fontsLoading,
  fontError,
}: ToolbarProps) {
  const compileDisabled = !backendReady || !hasFile || isCompiling;
  const exportDisabled = !backendReady || !canExport;
  const exportXmlDisabled = !backendReady || !canExportXml;
  const settingsDisabled = fontsLoading || fontError !== null;

  return (
    <header className={styles.toolbar}>
      <SelectFileButton onClick={onOpenFile} />

      <div className={styles.actions}>
        <BackendStatusThrobber backendReady={backendReady} />

        <ButtonGroup variant="contained">
          <CompileButton disabled={compileDisabled} onClick={onCompile} />
          <SettingsButton onClick={onSettings} disabled={settingsDisabled} />
        </ButtonGroup>

        <ExportDropdown
          exportDisabled={exportDisabled}
          exportXmlDisabled={exportXmlDisabled}
          onExport={onExport}
          onExportXml={onExportXml}
        />
      </div>
    </header>
  );
}