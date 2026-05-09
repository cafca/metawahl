import { useParams } from "react-router-dom";

import Legend from "@/components/Legend";
import SEO from "@/components/SEO";
import Thesis from "@/components/Thesis";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import useElection from "@/hooks/useElection";
import useThesis from "@/hooks/useThesis";
import { yearOf } from "@/lib/dates";
import type { ElectionSummary } from "@/types/api";

import "./Thesis.css";

export default function ThesisView() {
  const params = useParams();
  const territory = (params.territory ?? "deutschland") as TerritorySlug;
  const electionNum = Number.parseInt(params.electionNum ?? "0", 10);
  const thesisNum = Number.parseInt(params.thesisNum ?? "0", 10);

  const elQuery = useElection(electionNum);
  const thQuery = useThesis(electionNum, thesisNum);
  const base = useBase();

  const election = elQuery.data?.data;
  const thesis = thQuery.data?.data;
  const related = thQuery.data?.related ?? [];
  const isLoading = elQuery.isLoading || thQuery.isLoading;
  const legendShowMissing = election ? yearOf(election.date) < 2008 : false;

  const electionById = (id: number): ElectionSummary | undefined => {
    const elections = base.data?.data.elections;
    if (!elections) return undefined;
    for (const list of Object.values(elections)) {
      const found = list.find((e) => e.id === id);
      if (found) return found;
    }
    return undefined;
  };

  const relatedElems = related
    .map((t) => {
      const rel = electionById(t.election_id);
      if (rel == null) return null;
      return (
        <Thesis
          key={t.id}
          election={rel}
          linkElection={true}
          showHints={false}
          {...t}
        />
      );
    })
    .filter(Boolean);

  return (
    <main className="ui container app-main" id="outerContainer">
      <SEO
        title={
          "Metawahl: " + (election ? `${election.title} Quiz` : "Quiz")
        }
      />

      <div className="ui breadcrumb">
        <a className="section" href="/wahlen/">Wahlen</a>
        <i className="right angle icon divider" />
        <a className="section" href={`/wahlen/${territory}/`}>
          {TERRITORY_NAMES[territory] ?? territory}
        </a>
        <i className="right angle icon divider" />
        {election == null ? (
          <span className="section">Loading...</span>
        ) : (
          <>
            <a
              className="section"
              href={`/wahlen/${territory}/${electionNum}/`}
            >
              {yearOf(election.date)}
            </a>
            <i className="right angle icon divider" />
            <a
              className="active section"
              href={`/wahlen/${territory}/${electionNum}/${thesisNum}`}
            >
              These #{thesisNum + 1}
            </a>
          </>
        )}
      </div>

      {thesis && election && (
        <h1 className="ui header">
          These #{thesisNum + 1} aus dem Wahl-o-Mat zur {election.title}
        </h1>
      )}

      {isLoading && <div className="ui active centered inline loader" />}

      {!isLoading && thesis && election && (
        <div className="contentLoaded">
          <Legend
            text="Legende:"
            preliminary={election.preliminary ?? false}
            genericVariation={true}
            showMissing={legendShowMissing}
          />
          <Thesis
            election={election}
            linkElection={true}
            showHints={true}
            related={related}
            {...thesis}
          />
          <div>
            <h2 className="ui header large" id="relatedHeader">
              Ähnliche Thesen aus dem Archiv
            </h2>
            {relatedElems.length === 0 && (
              <p>
                Leider hat Metawahl in keinem anderen Wahl-o-Mat ähnliche Themen
                gefunden.
              </p>
            )}
            {relatedElems}
          </div>
        </div>
      )}
    </main>
  );
}
