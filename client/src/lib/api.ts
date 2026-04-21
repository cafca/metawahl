import { API_ROOT } from "@/config";

/**
 * Thrown by {@link apiFetch} and {@link apiPost} when the response is a
 * non-2xx status. Exposes the HTTP status, the fully-resolved URL and the
 * parsed response body (when JSON-decodable) for callers to inspect.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body: unknown;

  constructor(message: string, status: number, url: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

function resolveUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_ROOT.endsWith("/") ? API_ROOT.slice(0, -1) : API_ROOT;
  const rel = path.startsWith("/") ? path : `/${path}`;
  return base + rel;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.length === 0) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Typed wrapper around `fetch` that prepends {@link API_ROOT}, sets JSON
 * headers, and throws an {@link ApiError} on non-2xx responses.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = resolveUrl(path);
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json, text/plain, */*");
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });
  const body = await parseBody(res);

  if (!res.ok) {
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText} (${url})`,
      res.status,
      url,
      body,
    );
  }

  return body as T;
}

/**
 * Post a JSON body and decode the JSON response. Mirrors the legacy
 * `makeJSONRequest` helper.
 */
export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  return apiFetch<TRes>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
