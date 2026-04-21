import { useMemo, useState } from "react";

import { OPINION_COLORS } from "@/config";
import { cn } from "@/lib/utils";
import type { Position, Result, ThesisPosition } from "@/types/api";

/**
 * A party merged with its election-result row, plus an optional
 * `missing` sentinel value when no Wahl-o-Mat position was recorded
 * for a party that appeared in the result list.
 */
export interface PartyPositionDatum {
  party: string;
  /** `-1 | 0 | 1` when a Wahl-o-Mat position exists, `"missing"` otherwise. */
  value: Position | "missing";
  /** Percentage vote share, 0–100. */
  pct?: number | undefined;
  /** Absolute vote count, if present in the election result. */
  votes?: number | null | undefined;
  /** Raw position text — unused here but kept so callers can pass through. */
  text?: string | undefined;
  /** Display name override from the results feed. */
  name?: string | undefined;
  linked_position?: string | undefined;
}

export interface PositionChartProps {
  parties: readonly PartyPositionDatum[];
  /** Called when the user picks a party segment (click). */
  onSelect?: (datum: PartyPositionDatum) => void;
  preliminary?: boolean;
  /** If first segment in the first thesis should flag "(Wahlprognose)". */
  listIndex?: number;
  className?: string;
}

const VALUE_LABELS: Record<string, string> = {
  "1": "dafür",
  "0": "neutral",
  "-1": "dagegen",
  missing: "keine Angabe",
};

function colorFor(value: Position | "missing"): string {
  if (value === "missing") return OPINION_COLORS.missing;
  return OPINION_COLORS[String(value) as "-1" | "0" | "1"];
}

function sortPositions(a: PartyPositionDatum, b: PartyPositionDatum): number {
  // pro (1) first, then neutral (0), contra (-1), missing last
  if (a.value !== b.value) {
    if (a.value === "missing") return 1;
    if (b.value === "missing") return -1;
    return a.value < b.value ? 1 : -1;
  }
  const aPct = a.pct ?? null;
  const bPct = b.pct ?? null;
  if (aPct == null) return 1;
  if (bPct == null) return -1;
  if (aPct !== bPct) return aPct > bPct ? -1 : 1;
  if (a.votes != null && b.votes != null && a.votes !== b.votes) {
    return a.votes > b.votes ? -1 : 1;
  }
  return a.party > b.party ? 1 : -1;
}

/**
 * Stacked horizontal bar. Each party becomes a colored segment whose
 * width is proportional to its vote share. Hover surfaces a tooltip with
 * party name, position label and percentage.
 *
 * CSS-only hover: `group`/`group-hover` utilities toggle opacity + a
 * floating tooltip so the chart works without any JS hover state. A JS
 * click handler on each segment still fires `onSelect` for callers that
 * want to react on click.
 */
export function PositionChart({
  parties,
  onSelect,
  preliminary = false,
  listIndex,
  className,
}: PositionChartProps) {
  const sorted = useMemo(
    () =>
      [...parties]
        .filter((p) => (p.pct ?? 0) > 0.1)
        .sort(sortPositions),
    [parties],
  );

  // Track a sticky hover index so keyboard focus can also show the
  // tooltip; pure CSS hover still drives styling for the VR test so this
  // is purely additive.
  const [focused, setFocused] = useState<number | null>(null);

  const totalPct = sorted.reduce((acc, p) => acc + (p.pct ?? 0), 0);

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "positionChartContainer text-sm text-muted-foreground",
          className,
        )}
      >
        Keine Positionen verfügbar.
      </div>
    );
  }

  return (
    <div
      className={cn("positionChartContainer relative w-full", className)}
      data-slot="position-chart"
    >
      <div
        className="positionChart flex h-10 w-full overflow-hidden rounded-sm"
        role="group"
      >
        {sorted.map((datum, i) => {
          const pct = datum.pct ?? 0;
          const widthPct = totalPct > 0 ? (pct / totalPct) * 100 : 0;
          const label = VALUE_LABELS[String(datum.value)] ?? "";
          const pctRounded = Math.round(pct);
          const ariaLabel = `${datum.party}: ${label}, ${pctRounded}%`;
          const isFirstFirst =
            preliminary && listIndex === 0 && i === 0 ? " (Wahlprognose)" : "";
          const showLabel = widthPct >= 5;
          const isFocused = focused === i;

          return (
            <button
              type="button"
              key={`pc-${datum.party}-${i}`}
              className={cn(
                "rect group relative flex h-full min-w-0 flex-col items-start justify-center",
                "px-1 text-left text-white",
                "hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ring",
                `rect-${datum.value === "missing" ? "missing" : datum.value === 1 ? "pro" : datum.value === 0 ? "neutral" : "contra"}`,
              )}
              style={{
                width: `${widthPct}%`,
                backgroundColor: colorFor(datum.value),
                marginRight: i === sorted.length - 1 ? 0 : 1,
              }}
              aria-label={ariaLabel}
              onClick={() => onSelect?.(datum)}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused(null)}
              onMouseEnter={() => setFocused(i)}
              onMouseLeave={() => setFocused(null)}
            >
              {showLabel && (
                <>
                  <span className="chartLabel block truncate text-[11px] font-bold leading-tight">
                    {datum.party}
                  </span>
                  <span className="chartLabel block truncate text-[11px] leading-tight">
                    {pctRounded}%{isFirstFirst && (
                      <span className="positionChartFirstElementLabel">
                        {isFirstFirst}
                      </span>
                    )}
                  </span>
                </>
              )}
              <span
                role="tooltip"
                className={cn(
                  "pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow",
                  "group-hover:opacity-100",
                  isFocused && "opacity-100",
                )}
              >
                {datum.party} · {label} · {pctRounded}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Merge a thesis's position list with the election's results map, so the
 * PositionChart can size segments by vote share and know which parties
 * don't have a recorded Wahl-o-Mat answer.
 */
export function mergePartyData(
  positions: readonly ThesisPosition[],
  results: Record<string, Result>,
): PartyPositionDatum[] {
  const out: PartyPositionDatum[] = [];
  for (const party of Object.keys(results)) {
    const row = results[party];
    if (row == null) continue;
    const linked = row.linked_position ?? party;
    const pos =
      positions.find((p) => p.party === linked || p.party === party) ?? null;
    out.push({
      party,
      value: pos != null ? pos.value : "missing",
      pct: row.pct,
      votes: row.votes,
      text: pos?.text,
      linked_position: row.linked_position,
    });
  }
  return out;
}

export default PositionChart;
