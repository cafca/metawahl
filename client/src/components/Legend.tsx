import { COLOR_PALETTE, OPINION_COLORS } from "@/config";
import { cn } from "@/lib/utils";

type LegendProps = {
  text?: string;
  preliminary?: boolean;
  showMissing?: boolean;
  genericVariation?: boolean;
  className?: string;
};

/**
 * Small legend explaining the colour meanings used in thesis/position
 * visualisations.
 */
export function Legend({
  text,
  preliminary = false,
  showMissing = false,
  genericVariation = false,
  className,
}: LegendProps) {
  const proLabel = genericVariation
    ? "Dafür"
    : "Partei" + (preliminary ? " ist " : " war ") + "dafür";
  const neutralLabel = genericVariation ? "Neutral" : "neutral";
  const contraLabel = genericVariation ? "Dagegen" : "dagegen";

  let missingLabel: string | null = null;
  if (showMissing) {
    missingLabel = genericVariation ? "Partei nicht im Wahl-o-Mat" : "nicht im Wahl-o-Mat";
  } else if (preliminary) {
    missingLabel = "Kleinparteien";
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm",
        className,
      )}
    >
      {text != null && <span className="text-muted-foreground">{text}</span>}
      <LegendSwatch color={COLOR_PALETTE[2]!} label={proLabel} />
      <LegendSwatch color={COLOR_PALETTE[1]!} label={neutralLabel} />
      <LegendSwatch color={COLOR_PALETTE[0]!} label={contraLabel} />
      {missingLabel != null && (
        <LegendSwatch color={OPINION_COLORS.missing} label={missingLabel} />
      )}
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </span>
  );
}

export default Legend;
