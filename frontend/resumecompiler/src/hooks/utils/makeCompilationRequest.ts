export type CompileOptions = {
  endpoint: string;
  body: { markdown: string };
  acceptHeader: "application/pdf" | "application/xml";
  queryParams?: Record<string, string>;
};

export async function makeCompilationRequest(
  options: CompileOptions
): Promise<Response> {
  const url = buildUrl(options.endpoint, options.queryParams);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: options.acceptHeader,
    },
    body: JSON.stringify(options.body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorType = errorBody?.error || "UnknownError";
    const errorMessage = errorBody?.message || `Backend returned ${response.status}.`;
    throw new Error(`${errorType}: ${errorMessage}`);
  }

  return response;
}

function buildUrl(base: string, params?: Record<string, string>): string {
  if (!params) return base;
  const search = new URLSearchParams(params).toString();
  return search ? `${base}?${search}` : base;
}