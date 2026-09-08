import { useCallback, useState } from "react";

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

      const xmlEndpoint = await getXmlEndpoint();

      try {
        const response = await fetch(xmlEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/xml",
          },
          body: JSON.stringify({ markdown }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const errorType = errorBody?.error || "UnknownError";
          const errorMessage = errorBody?.message || `Backend returned ${response.status}.`;
          throw new Error(`${errorType}: ${errorMessage}`);
        }

        return await response.text();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to export XML.";
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
