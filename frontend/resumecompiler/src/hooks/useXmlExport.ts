import {useCallback, useState} from "react";
import {makeCompilationRequest} from "./utils/makeCompilationRequest.ts";

export type UseXmlExportResult = {
  isExportingXml: boolean;
  xmlError: string | null;
  exportXml: (markdown: string) => Promise<string>;
};

export function useXmlExport(
  getXmlEndpoint: () => Promise<string>
): UseXmlExportResult {
  const [isExportingXml, setIsExportingXml] = useState(false);
  const [xmlError, setXmlError] = useState<string | null>(null);

  const exportXml = useCallback(
    async (markdown: string): Promise<string> => {
      setIsExportingXml(true);
      setXmlError(null);

      try {
        const xmlEndpoint = await getXmlEndpoint();
        const response = await makeCompilationRequest({
          endpoint: xmlEndpoint,
          body: {markdown},
          acceptHeader: "application/xml",
        });
        return response.text();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to export XML.";
        setXmlError(message);
        throw error;
      } finally {
        setIsExportingXml(false);
      }
    },
    [getXmlEndpoint]
  );

  return { isExportingXml, xmlError, exportXml };
}
