import { afterEach, describe, expect, it, vi } from "vitest";
import { API_ROOT } from "@/config";
import { ApiError, apiFetch, apiPost } from "./api";

interface FetchCall {
  url: string;
  init: RequestInit | undefined;
}

function mockFetch(response: Response): FetchCall[] {
  const calls: FetchCall[] = [];
  const fn = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return response;
  });
  vi.stubGlobal("fetch", fn);
  return calls;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("prepends API_ROOT to relative paths and decodes JSON", async () => {
    const calls = mockFetch(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await apiFetch<{ ok: boolean }>("/base");
    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(1);
    expect(calls[0]!.url).toBe(`${API_ROOT}/base`);
  });

  it("normalises paths that already start with a slash", async () => {
    const calls = mockFetch(new Response("{}", { status: 200 }));
    await apiFetch("/elections/1");
    expect(calls[0]!.url).toBe(`${API_ROOT}/elections/1`);
  });

  it("sets a default Accept header", async () => {
    const calls = mockFetch(new Response("null", { status: 200 }));
    await apiFetch("/base");
    const headers = new Headers(calls[0]!.init?.headers);
    expect(headers.get("Accept")).toMatch(/application\/json/);
  });

  it("throws ApiError on a 404 response", async () => {
    mockFetch(
      new Response(JSON.stringify({ error: "missing" }), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(apiFetch("/thesis/WOM-999-99")).rejects.toBeInstanceOf(ApiError);

    // Re-issue because the promise above already consumed the mock call.
    mockFetch(
      new Response(JSON.stringify({ error: "missing" }), {
        status: 404,
        statusText: "Not Found",
        headers: { "Content-Type": "application/json" },
      }),
    );
    try {
      await apiFetch("/thesis/WOM-999-99");
      throw new Error("expected apiFetch to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(404);
      expect(apiErr.url).toBe(`${API_ROOT}/thesis/WOM-999-99`);
      expect(apiErr.body).toEqual({ error: "missing" });
    }
  });

  it("throws ApiError on a 500 response with a non-JSON body", async () => {
    mockFetch(new Response("boom", { status: 500, statusText: "Server Error" }));

    await expect(apiFetch("/base")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
  });
});

describe("apiPost", () => {
  it("serialises the body as JSON and POSTs it", async () => {
    const calls = mockFetch(new Response("{}", { status: 200 }));
    await apiPost<{ answer: number }, unknown>("/quiz/1/0", { answer: 1 });

    expect(calls).toHaveLength(1);
    expect(calls[0]!.init?.method).toBe("POST");
    expect(calls[0]!.init?.body).toBe(JSON.stringify({ answer: 1 }));
    const headers = new Headers(calls[0]!.init?.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
