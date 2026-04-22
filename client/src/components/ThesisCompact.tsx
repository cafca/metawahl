import { useCallback, useMemo, useState } from "react";

import PositionChart from "@/components/PositionChart";
import { extractThesisId } from "@/lib/thesis";
import type {
  ElectionSummary,
  MergedPartyData,
  Thesis as ThesisData,
  ThesisPosition,
} from "@/types/api";

import "./Thesis.css";

type OpenText = MergedPartyData & {
  header?: string;
};

const valueNames: Record<string, string> = {
  "-1": "dagegen",
  "0": "neutral",
  "1": "dafür",
};

type Props = ThesisData & {
  election: ElectionSummary;
  linkElection?: boolean;
  showHints?: boolean;
  quizMode?: boolean;
  listIndex?: number;
  iframe?: boolean;
};

function mergePartyData(
  election: ElectionSummary,
  positions: ThesisPosition[],
): MergedPartyData[] {
  const res = election.results;
  return Object.keys(res).map((party) => {
    const linked_position = res[party]!.linked_position ?? party;
    const found =
      positions
        .filter(
          (pos) => pos.party === linked_position || pos.party === party,
        )
        .shift() ?? { party, value: "missing" as const };
    const merged: MergedPartyData = {
      party,
      pct: res[party]!.pct,
      votes: res[party]!.votes,
      value: (found as ThesisPosition).value != null
        ? (String((found as ThesisPosition).value) as MergedPartyData["value"])
        : "missing",
      text: (found as ThesisPosition).text,
      linked_position: res[party]!.linked_position,
      missing: res[party]!.missing,
      name: res[party]!.name,
    };
    return merged;
  });
}

export function ThesisCompact(props: Props) {
  const { election, positions, text, id, listIndex, iframe } = props;

  const parties = useMemo(
    () => mergePartyData(election, positions),
    [election, positions],
  );

  const proPositions = useMemo(
    () => parties.filter((p) => p.value === "1"),
    [parties],
  );
  const neutralPositions = useMemo(
    () => parties.filter((p) => p.value === "0"),
    [parties],
  );
  const contraPositions = useMemo(
    () => parties.filter((p) => p.value === "-1"),
    [parties],
  );

  const [openText, setOpenText] = useState<OpenText | null>(null);

  const toggleOpen = useCallback(
    (position: MergedPartyData | null) => {
      if (position == null) {
        setOpenText(null);
        return;
      }

      let newOpenText: OpenText;
      if (position.party === "Sonstige") {
        newOpenText = {
          ...position,
          text: "Kleine Parteien sind in den Prognosewerten nicht enthalten, da deren Wahlergebnisse kaum vorherzusehen sind.",
        };
      } else if (position.value === "missing") {
        newOpenText = {
          ...position,
          text: "Von dieser Partei liegen zu dieser Wahl keine Stellungnahmen vor.",
        };
      } else if (position.text == null || position.text.length === 0) {
        newOpenText = {
          ...position,
          text: "Es liegt keine Begründung zur Position dieser Partei vor.",
        };
      } else {
        newOpenText = { ...position, text: "»" + position.text + "«" };
      }

      const result = election.results[newOpenText.party];
      const name = result?.name ?? newOpenText.party;
      const posKey = newOpenText.value.toString();
      const posName =
        Object.keys(valueNames).indexOf(posKey) > -1 ? valueNames[posKey] : "";
      newOpenText.header = `${name} ${posName}:`;

      setOpenText(newOpenText);
    },
    [election],
  );

  const proCount = proPositions.length;
  const totalCount =
    proPositions.length + neutralPositions.length + contraPositions.length;

  const thesisIdComps = extractThesisId(id);
  const tUrl =
    thesisIdComps != null
      ? `/wahlen/${election.territory}/${election.id}/${thesisIdComps.thesisNum}/`
      : `/wahlen/${election.territory}/`;

  const visible = openText != null;

  return (
    <div>
      <PositionChart
        parties={parties}
        toggleOpen={toggleOpen}
        compact={true}
        preliminary={election.preliminary}
        listIndex={listIndex}
      />
      {openText === null && (
        <span className="thesisTitleInsert">
          {proCount} von {totalCount} Parteien{" "}
          {proCount === 1 ? "fordert" : "fordern"}: {text}
        </span>
      )}
      {visible && openText != null && (
        <div>
          <div className="ui attached message positionPopup">
            <i
              className="close icon"
              onClick={() => toggleOpen(null)}
              style={{ cursor: "pointer" }}
            />
            <div className="header">{text}</div>
            <p>
              <strong>{openText.header}</strong> {openText.text}
            </p>
          </div>
          <div className="ui bottom attached info message">
            <i className="arrow right icon" />
            {iframe === true ? (
              <span>
                <a href={tUrl} style={{ textDecoration: "underline" }}>
                  Öffne diese These auf Metawahl.de
                </a>{" "}
                und finde heraus, wie die Parteien ihre Position gegenüber
                vergangenen Wahlen geändert haben.
              </span>
            ) : (
              <a href={tUrl} style={{ cursor: "pointer" }}>
                <span>
                  In der{" "}
                  <span style={{ textDecoration: "underline" }}>
                    Detailansicht
                  </span>{" "}
                  zu dieser These findest du heraus, wie die Parteien ihre
                  Position gegenüber vergangenen Wahlen geändert haben.
                </span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ThesisCompact;
