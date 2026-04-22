import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Map from "@/components/Map";
import PositionChart from "@/components/PositionChart";
import TagBadge from "@/components/TagBadge";
import {
  COLOR_PALETTE,
  IS_ADMIN,
  OPINION_COLORS,
} from "@/config";
import { extractThesisId } from "@/lib/thesis";
import type {
  ElectionSummary,
  MergedPartyData,
  QuizAnswer,
  Tag,
  Thesis as ThesisData,
  ThesisPosition,
} from "@/types/api";

import "./Thesis.css";

type OpenText = MergedPartyData & {
  header?: string;
};

const valueNames: Record<string, string> = {
  "-1": "Dagegen",
  "0": "Neutral",
  "1": "Dafür",
};

function ElectionSubtitle({ election }: { election?: ElectionSummary }) {
  if (election == null) return null;
  return (
    <span>
      <Map
        territory={election.territory}
        inverted={true}
        style={{ height: "3em", float: "right", paddingLeft: ".5em" }}
      />{" "}
      <p
        style={{
          fontVariant: "all-small-caps",
          marginBottom: ".3rem",
          lineHeight: "1em",
          color: "rgba(255,255,255,.8)",
        }}
      >
        {election.title}
      </p>
    </span>
  );
}

type Props = ThesisData & {
  election: ElectionSummary;
  linkElection?: boolean;
  showHints?: boolean;
  quizMode?: boolean;
  hideTags?: boolean;
  related?: ThesisData[];
  answer?: (quizAnswer: QuizAnswer, voterOpinion: QuizAnswer) => void;
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

export function Thesis(props: Props) {
  const { election, positions, tags: initialTags, text, id, related } = props;

  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [openText, setOpenText] = useState<OpenText | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<QuizAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  const parties = useMemo(
    () => mergePartyData(election, positions),
    [election, positions],
  );

  const proPositions = useMemo(
    () => parties.filter((p) => p.value === "1"),
    [parties],
  );
  const contraPositions = useMemo(
    () => parties.filter((p) => p.value === "-1"),
    [parties],
  );

  const { voterOpinion, ratioPro, ratioContra } = useMemo(() => {
    const countVotes = (prev: number, cur: MergedPartyData) =>
      election.results[cur.party] == null
        ? prev
        : prev + (election.results[cur.party]!.pct ?? 0);

    const rPro = proPositions.reduce(countVotes, 0.0);
    const rContra = contraPositions.reduce(countVotes, 0.0);

    let opinion: QuizAnswer;
    if (rPro > 50.0) {
      opinion = 1;
    } else if (rContra < 50.0) {
      opinion = 0;
    } else {
      opinion = -1;
    }
    return { voterOpinion: opinion, ratioPro: rPro, ratioContra: rContra };
  }, [proPositions, contraPositions, election]);

  const relatedTagsList = useMemo(() => {
    if (related == null) return [];
    const tagMap: Record<string, Tag & { count: number }> = {};
    related.forEach((th) => {
      th.tags.forEach((tag) => {
        if (tags.find((t) => t.title === tag.title)) return;
        if (tagMap[tag.title] != null) {
          tagMap[tag.title]!.count += 1;
        } else {
          tagMap[tag.title] = { ...tag, count: 1 };
        }
      });
    });
    const arr = Object.values(tagMap);
    arr.sort((a, b) => b.count - a.count);
    return arr.slice(0, 10);
  }, [related, tags]);

  const [relatedState, setRelatedState] = useState<
    (Tag & { count: number })[]
  >([]);
  useEffect(() => {
    setRelatedState(relatedTagsList);
  }, [relatedTagsList]);

  const sendTagChanges = useCallback(
    async (_data: {
      remove: string[];
      add: Tag[];
    }) => {
      // TODO admin: wire POST /thesis/:id/tags/ for admin tag edits.
      setLoading(true);
      try {
        // Stub: not wired. Kept to preserve the UX path for admin users.
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleTagRemove = useCallback(
    (title: string) => {
      void sendTagChanges({ add: [], remove: [title] });
    },
    [sendTagChanges],
  );

  const handleRelatedTagClick = useCallback(
    (tag: Tag) => {
      void sendTagChanges({ add: [tag], remove: [] });
      setRelatedState((prev) => prev.filter((t) => t.title !== tag.title));
    },
    [sendTagChanges],
  );

  const handleAnswer = useCallback(
    (answer: QuizAnswer) => {
      setQuizAnswer(answer);
      props.answer?.(answer, voterOpinion);
    },
    [props, voterOpinion],
  );

  const toggleOpen = useCallback(
    (position: MergedPartyData) => {
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
      const resultPct = (result?.pct ?? null) !== null ? `${result!.pct}%` : "<0,1%";
      const posKey = newOpenText.value.toString();
      const posName =
        Object.keys(valueNames).indexOf(posKey) > -1
          ? ": " + valueNames[posKey]
          : "";
      newOpenText.header = `${name} — ${resultPct}${posName}`;

      setOpenText(newOpenText);
    },
    [election],
  );

  const collectSources = (): ReactNode[] => {
    const sources: ReactNode[] = [];
    if (election != null) {
      sources.push(
        <span key="wom-source">
          <a href={election.source}>
            Wahl-o-Mat zur {election.title} der Bundeszentrale für politische
            Bildung
          </a>{" "}
          via{" "}
          <a href="https://github.com/gockelhahn/qual-o-mat-data">
            qual-o-mat-data
          </a>
        </span>,
      );
      if (election.results_source) {
        let source_name = election.results_source.name;
        const source_url = election.results_source.url;
        if (source_name == null) {
          if (source_url.indexOf("wahl.tagesschau.de") >= 0) {
            source_name = "Wahlergebnisse: wahl.tagesschau.de";
          } else if (source_url.indexOf("wikipedia") >= 0) {
            source_name =
              "Wahlergebnisse: Wikipedia und lizensiert unter CC-BY-NC-SA-3.0";
          } else if (source_url.indexOf("dawum.de") >= 0) {
            source_name =
              "Wahlprognose von dawum.de und lizensiert unter CC-BY-NC-SA-4.0";
          } else {
            source_name = source_url;
          }
        }
        sources.push(
          <span key="results-source">
            ,<a href={source_url}>{source_name}</a>
          </span>,
        );
      }
    }
    return sources;
  };

  const tagElems = tags
    .slice()
    .sort((t1, t2) => (t1.slug > t2.slug ? 1 : -1))
    .map((tag) => (
      <TagBadge
        data={tag}
        key={"Tag-" + tag.title}
        remove={handleTagRemove}
      />
    ));

  let voterOpinionColor: string;
  if (voterOpinion === 0) {
    voterOpinionColor = COLOR_PALETTE[1]!;
  } else {
    voterOpinionColor =
      voterOpinion === -1 ? COLOR_PALETTE[0]! : COLOR_PALETTE[2]!;
  }

  const sources = collectSources();

  const quizActive = props.quizMode === true;
  const showDetails = !quizActive || quizAnswer != null;

  const headerStyle: React.CSSProperties = showDetails
    ? {
        backgroundColor: voterOpinionColor,
        minHeight: props.linkElection ? "4em" : undefined,
        fontSize: "1.7rem",
      }
    : {
        fontSize: "1.7rem",
        backgroundColor: "#333",
        color: "#fcfcfc",
      };

  const margin = "2em";

  let subHeader = "";
  if (voterOpinion === 0) {
    subHeader = " Keine Mehrheit dafür oder dagegen";
  } else if (voterOpinion === 1) {
    subHeader = Math.round(ratioPro).toString();
    subHeader += election.preliminary
      ? " von 100 werden voraussichtlich Parteien wählen, die dafür sind"
      : " von 100 haben Parteien gewählt, die dafür waren";
  } else {
    subHeader = Math.round(ratioContra).toString();
    subHeader += election.preliminary
      ? " von 100 werden voraussichtlich Parteien wählen, die dagegen sind"
      : " von 100 haben Parteien gewählt, die dagegen waren";
  }

  const thesisIdComps = extractThesisId(id);
  const permaLink =
    thesisIdComps != null
      ? `/wahlen/${election.territory}/${thesisIdComps.womId}/${thesisIdComps.thesisNum}/`
      : `/wahlen/${election.territory}/`;

  const relatedTagBadges = !IS_ADMIN
    ? null
    : relatedState.map((tag) => (
        <TagBadge
          data={tag}
          key={`related-${tag.title}`}
          onClick={() => handleRelatedTagClick(tag)}
        />
      ));

  return (
    <div style={{ marginBottom: margin }}>
      <a href={permaLink}>
        <h2
          className="ui top attached inverted huge header"
          style={headerStyle}
        >
          {props.linkElection && <ElectionSubtitle election={election} />}

          {text}

          <div className="sub header" style={{ marginTop: "0.3em" }}>
            {showDetails && <span>{subHeader}</span>}
          </div>
        </h2>
      </a>

      {showDetails && (
        <span>
          <div
            className="ui attached segment"
            id={id}
            style={{ paddingBottom: "1.5em" }}
          >
            <h5 className="ui sub header" style={{ color: "rgba(0,0,0,.65)" }}>
              Stimmverteilung{" "}
              {election.preliminary ? " (Prognose)" : ""}
            </h5>

            <PositionChart parties={parties} toggleOpen={toggleOpen} />

            {openText != null && (
              <div className="ui floating message">
                <div className="header">{openText.header}</div>
                <p>{openText.text}</p>
              </div>
            )}

            {props.showHints === true && openText == null && (
              <div className="ui message" style={{ marginTop: "1rem" }}>
                <i className="hand point right outline icon" /> Bewege deine
                Maus über die Parteinamen, um deren Position zu dieser These zu
                lesen.
              </div>
            )}

            {error != null && (
              <div className="ui negative message">{error}</div>
            )}

            <p className="sources" onClick={() => setShowSources(true)}>
              Quellen
              {showSources && <span>: {sources}</span>}
            </p>
          </div>

          {props.hideTags !== true && (
            <div
              className={`ui ${IS_ADMIN ? "attached" : "bottom attached"} secondary segment`}
            >
              {props.showHints === true && (
                <h4 className="ui small header">
                  Alle Parteipositionen zu:
                </h4>
              )}
              {tagElems}
              <br />
              {tagElems.length === 0 && IS_ADMIN && " Noch keine Tags gewählt. "}
            </div>
          )}

          {IS_ADMIN && (
            <div
              className="ui bottom attached secondary segment"
              style={{ minHeight: 70 }}
            >
              {relatedTagBadges != null && relatedTagBadges.length > 0 && (
                <div style={{ maxWidth: "70%", display: "inline-block" }}>
                  <h4 className="ui small header">
                    Verwandte Tags hinzufügen:
                  </h4>
                  {relatedTagBadges}
                </div>
              )}
              {/* TODO admin: port WikidataTagger for tag suggestions. */}
              {loading && <div className="ui active loader" />}
            </div>
          )}
        </span>
      )}

      {quizActive && quizAnswer == null && (
        <div className="ui fluid stackable bottom attached buttons quizButtons">
          <button
            className="ui button"
            onClick={() => handleAnswer(1)}
            style={{ backgroundColor: OPINION_COLORS[1] }}
          >
            Mehrheit stimmt dafür
          </button>
          <button
            className="ui button"
            onClick={() => handleAnswer(-1)}
            style={{ backgroundColor: OPINION_COLORS[-1] }}
          >
            Mehrheit stimmt dagegen
          </button>
        </div>
      )}
    </div>
  );
}

export default Thesis;
