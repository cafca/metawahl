import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function formatLongGerman(iso: string): string {
  return format(parseISO(iso), "d. MMMM yyyy", { locale: de });
}

export function yearOf(iso: string): number {
  return parseISO(iso).getFullYear();
}
