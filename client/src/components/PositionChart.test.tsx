import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PositionChart, mergePartyData, type PartyPositionDatum } from "./PositionChart";
import type { Result, ThesisPosition } from "@/types/api";

const threeParties: PartyPositionDatum[] = [
  { party: "CDU", value: 1, pct: 40, votes: null },
  { party: "SPD", value: 0, pct: 30, votes: null },
  { party: "Linke", value: -1, pct: 30, votes: null },
];

describe("PositionChart", () => {
  it("renders one segment per party with an accessible label", () => {
    render(<PositionChart parties={threeParties} />);

    expect(screen.getByRole("button", { name: /CDU: dafür, 40%/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /SPD: neutral, 30%/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Linke: dagegen, 30%/ })).toBeInTheDocument();
  });

  it("sizes segments proportionally to their percentage share", () => {
    const { container } = render(<PositionChart parties={threeParties} />);
    const segments = container.querySelectorAll<HTMLButtonElement>(
      "[data-slot='position-chart'] button.rect",
    );
    expect(segments).toHaveLength(3);
    // Sorted order: pro (40), neutral (30), contra (30).
    expect(segments[0]!.style.width).toBe("40%");
    expect(segments[1]!.style.width).toBe("30%");
    expect(segments[2]!.style.width).toBe("30%");
  });

  it("drops parties with less than 0.1% share", () => {
    render(
      <PositionChart
        parties={[
          ...threeParties,
          { party: "Fake", value: 1, pct: 0.05, votes: null },
        ]}
      />,
    );
    expect(screen.queryByRole("button", { name: /Fake/ })).toBeNull();
  });

  it("renders a fallback when there are no visible parties", () => {
    render(<PositionChart parties={[]} />);
    expect(screen.getByText(/Keine Positionen verfügbar/)).toBeInTheDocument();
  });
});

describe("mergePartyData", () => {
  it("marks parties with no thesis position as 'missing'", () => {
    const positions: ThesisPosition[] = [{ party: "CDU", value: 1 }];
    const results: Record<string, Result> = {
      CDU: { pct: 40, votes: null },
      SPD: { pct: 30, votes: null },
    };
    const merged = mergePartyData(positions, results);
    const cdu = merged.find((p) => p.party === "CDU");
    const spd = merged.find((p) => p.party === "SPD");
    expect(cdu?.value).toBe(1);
    expect(spd?.value).toBe("missing");
  });

  it("follows linked_position when matching party positions", () => {
    const positions: ThesisPosition[] = [
      { party: "Bündnis 90/Die Grünen", value: -1 },
    ];
    const results: Record<string, Result> = {
      Grüne: {
        pct: 11.9,
        votes: null,
        linked_position: "Bündnis 90/Die Grünen",
      },
    };
    const merged = mergePartyData(positions, results);
    expect(merged[0]?.value).toBe(-1);
  });
});
