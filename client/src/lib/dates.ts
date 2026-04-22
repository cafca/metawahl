import { format, isValid, parseISO } from "date-fns";
import { de } from "date-fns/locale";

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const normalized = iso.replace(" ", "T").replace(/\s*Z$/, "Z");
  const d = parseISO(normalized);
  return isValid(d) ? d : null;
}

export function formatLongGerman(iso: string | null | undefined): string {
  const d = parse(iso);
  return d ? format(d, "d. MMMM yyyy", { locale: de }) : "";
}

export function yearOf(iso: string | null | undefined): number {
  const d = parse(iso);
  return d ? d.getFullYear() : NaN;
}
