import { useEffect, useMemo, useRef, useState } from "react";

import { OPINION_COLORS } from "@/config";
import type { MergedPartyData } from "@/types/api";

import "./PositionChart.css";

const valueNames: Record<string, string> = {
  "1": "pro",
  "0": "neutral",
  "-1": "contra",
};

// Gap between colored rectangles
const gapWidth = 1;

type RectProps = {
  party: string;
  value: MergedPartyData["value"];
  toggleOpen: () => void;
  handleHover: (party: string | null) => void;
  hovered: boolean;
  width: number;
  xPos: number;
};

function Rect({
  party,
  value,
  toggleOpen,
  handleHover,
  hovered,
  width,
  xPos,
}: RectProps) {
  const baseStyle: React.CSSProperties = {
    fill: OPINION_COLORS[value],
    fillOpacity: hovered ? 0.45 : 1.0,
  };

  return (
    <rect
      className={"rect rect-" + valueNames[value.toString()]}
      height="100%"
      onClick={() => toggleOpen()}
      onMouseOver={() => handleHover(party)}
      style={baseStyle}
      width={width}
      x={xPos.toString() + "px"}
    />
  );
}

type Props = {
  parties: MergedPartyData[];
  toggleOpen: (data: MergedPartyData) => void;
  compact?: boolean;
  preliminary?: boolean;
  listIndex?: number;
};

function sortPositions(a: MergedPartyData, b: MergedPartyData): number {
  // First sort into pro, neutral, contra and missing
  if (a.value !== b.value) {
    return a.value === "missing"
      ? 1
      : b.value === "missing"
        ? -1
        : a.value < b.value
          ? 1
          : -1;
  } else {
    if (a.pct == null) return 1;
    if (b.pct == null) return -1;

    if (a.pct !== b.pct) {
      return a.pct > b.pct ? -1 : 1;
    } else if (a.votes != null && b.votes != null && a.votes !== b.votes) {
      return a.votes > b.votes ? -1 : 1;
    }

    return a.party > b.party ? 1 : -1;
  }
}

export function PositionChart({
  parties,
  toggleOpen,
  compact,
  preliminary,
  listIndex,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...(parties ?? [])].sort(sortPositions);
  }, [parties]);

  useEffect(() => {
    let measureTimeout: ReturnType<typeof setTimeout> | null = null;

    const measure = () => {
      if (svgRef.current != null) {
        const { width: w } = svgRef.current.getBoundingClientRect();
        setWidth(w);
      }
    };

    const waitAndMeasure = () => {
      if (measureTimeout != null) clearTimeout(measureTimeout);
      measureTimeout = setTimeout(measure, 50);
    };

    measure();
    window.addEventListener("resize", waitAndMeasure);
    return () => {
      window.removeEventListener("resize", waitAndMeasure);
      if (measureTimeout != null) clearTimeout(measureTimeout);
    };
  }, []);

  const handleHover = (data: MergedPartyData | null) => {
    const party = data?.party ?? null;
    if (hovered !== party) {
      setHovered(party);
    }
    if (compact !== true) {
      if (data) toggleOpen(data);
    }
  };

  const visibleParties = sorted.filter((d) => d.pct > 0.1);
  const combinedGapWidth = gapWidth * Math.max(0, visibleParties.length - 1);
  const usablePixels = width - combinedGapWidth;

  let rectangles: React.ReactNode[] = [];
  if (usablePixels > 0) {
    let usedPixels = 0;
    rectangles = visibleParties.map((data, i) => {
      const rectWidth = Math.round((data.pct * usablePixels) / 100.0);
      usedPixels += rectWidth + gapWidth;
      const xPos = usedPixels - rectWidth - gapWidth;
      return (
        <g key={"rect-" + data.party}>
          <Rect
            party={data.party}
            value={data.value}
            hovered={hovered === data.party}
            handleHover={() => handleHover(data)}
            width={rectWidth}
            xPos={xPos}
            toggleOpen={() => toggleOpen(data)}
          />
          {data.pct >= 5 && (
            <text
              x={xPos + 5}
              y={"66%"}
              width={rectWidth}
              onClick={() => toggleOpen(data)}
              onMouseOver={() => handleHover(data)}
              onMouseOut={() => handleHover(null)}
              className="chartLabel"
            >
              <tspan x={xPos + 4} y="40%" style={{ fontWeight: "bold" }}>
                {data.party}
              </tspan>
              <tspan x={xPos + 4} y="80%">
                {Math.trunc(data.pct)}%{" "}
                <tspan className="positionChartFirstElementLabel">
                  {preliminary && listIndex === 0 && i === 0 && "(Wahlprognose)"}
                </tspan>
              </tspan>
            </text>
          )}
        </g>
      );
    });
  }

  return (
    <span
      className="positionChartContainer"
      onMouseLeave={() => handleHover(null)}
    >
      <svg
        width="100%"
        height="40"
        className="positionChart"
        ref={svgRef}
        shapeRendering="crispEdges"
        style={{ margin: "0.3em 0" }}
      >
        <g className="bar">{rectangles}</g>
      </svg>
    </span>
  );
}

export default PositionChart;
