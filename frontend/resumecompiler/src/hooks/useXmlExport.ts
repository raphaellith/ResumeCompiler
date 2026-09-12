import {useCallback, useState} from "react";
import { ApiClient } from "../config/api.ts";

export type UseXmlExportResult = {
  isExportingXml: boolean;
  xmlError: string | null;
  exportXml: (markdown: string) => Promise<string>;
};

export function useXmlExport(): UseXmlExportResult {
  const [isExportingXml, setIsExportingXml] = useState(false);
  const [xmlError, setXmlError] = useState<string | null>(null);

  const exportXml = useCallback(
    async (markdown: string): Promise<string> => {
      setIsExportingXml(true);
      setXmlError(null);

      try {
        const response = await ApiClient.getResponseFromPostRequestToXmlEndpoint(markdown);
        return response.text();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to export XML.";
        setXmlError(message);
        throw error;
      } finally {
        setIsExportingXml(false);
      }
    },
    []
  );

  return { isExportingXml, xmlError, exportXml };
}
