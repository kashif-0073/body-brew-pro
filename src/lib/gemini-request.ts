export function createGeminiRequest(apiKey: string, payload: unknown) {
  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
  );
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.set("x-goog-api-key", apiKey);

  return {
    url: url.toString(),
    init: {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    } satisfies RequestInit,
  };
}