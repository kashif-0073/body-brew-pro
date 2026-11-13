import { describe, expect, it } from "vitest";
import { createGeminiRequest } from "./gemini-request";

describe("Gemini request authentication", () => {
  it("sends new AI Studio keys in the API-key header first", () => {
    const request = createGeminiRequest("AQ.Ab8RNexampleKey", { contents: [] });
    const headers = new Headers(request.init.headers);

    expect(headers.get("x-goog-api-key")).toBe("AQ.Ab8RNexampleKey");
    expect(new URL(request.url).searchParams.has("key")).toBe(false);
  });

  it("supports the AQ-key query fallback without duplicate credentials", () => {
    const request = createGeminiRequest("AQ.Ab8RNexampleKey", { contents: [] }, "query");
    const headers = new Headers(request.init.headers);

    expect(new URL(request.url).searchParams.get("key")).toBe("AQ.Ab8RNexampleKey");
    expect(headers.has("x-goog-api-key")).toBe(false);
  });

  it("keeps legacy keys in the API-key header", () => {
    const request = createGeminiRequest("AIzaSyExampleKey", { contents: [] });
    const headers = new Headers(request.init.headers);

    expect(headers.get("x-goog-api-key")).toBe("AIzaSyExampleKey");
    expect(new URL(request.url).searchParams.has("key")).toBe(false);
  });
});