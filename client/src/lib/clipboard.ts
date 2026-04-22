import { toast } from "sonner";

import { SITE_ROOT } from "@/config";

const DEFAULT_TOAST = "Link in die Zwischenablage kopiert";

/**
 * Resolve a possibly-relative URL against `SITE_ROOT` so copied links always
 * point at the canonical public origin (rather than, e.g., `localhost:3000`
 * during development).
 */
export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const prefix = pathOrUrl.startsWith("/") ? "" : "/";
  return `${SITE_ROOT}${prefix}${pathOrUrl}`;
}

/**
 * Copy `text` to the user's clipboard and surface a toast. Falls back to a
 * best-effort `document.execCommand("copy")` for older browsers where the
 * async Clipboard API is unavailable.
 */
export async function copyToClipboard(
  text: string,
  toastMessage: string = DEFAULT_TOAST,
): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText != null) {
      await navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      if (!ok) throw new Error("execCommand copy failed");
    }
    toast.success(toastMessage);
    return true;
  } catch (error) {
    console.error("Copy to clipboard failed", error);
    toast.error("Kopieren fehlgeschlagen");
    return false;
  }
}
