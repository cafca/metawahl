import { SITE_ROOT } from "@/config";

export function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const prefix = pathOrUrl.startsWith("/") ? "" : "/";
  return `${SITE_ROOT}${prefix}${pathOrUrl}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
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
    return true;
  } catch (error) {
    console.error("Copy to clipboard failed", error);
    return false;
  }
}
