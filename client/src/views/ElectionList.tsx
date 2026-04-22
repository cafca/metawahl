import { Link } from "react-router-dom";

import Map from "@/components/Map";
import SEO from "@/components/SEO";
import useBase from "@/hooks/useBase";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import { formatLongGerman, yearOf } from "@/lib/dates";
import type { ElectionSummary } from "@/types/api";

import "./ElectionList.css";

function sortByDateDesc(a: ElectionSummary, b: ElectionSummary) {
  return a.date < b.date ? 1 : -1;
}

function titleBeforeSpace(title: string): string {
  const i = title.indexOf(" ");
  return i === -1 ? title : title.slice(0, i);
}

type ColumnProps = {
  territory: TerritorySlug;
  elections: ElectionSummary[];
};

function TerritoryColumn({ territory, elections }: ColumnProps) {
  const items = elections
    .slice()
    .sort(sortByDateDesc)
    .map((election) => (
      <a
        key={election.id}
        href={`/wahlen/${election.territory}/${election.id}/`}
        className="item electionListItem"
      >
        <div className="content">
          <h3 className="header">{yearOf(election.date)}</h3>
          <span>
            {titleBeforeSpace(election.title)} vom {formatLongGerman(election.date)}
          </span>
        </div>
      </a>
    ));

  return (
    <div className="column territory">
      <Map territory={territory} style={{ maxHeight: "10em" }} />
      <h1 className="ui dividing header">
        <Link to={`/wahlen/${territory}/`}>{TERRITORY_NAMES[territory]}</Link>
      </h1>
      <div className="ui relaxed list">{items}</div>
    </div>
  );
}

export default function ElectionList() {
  const base = useBase();
  const elections = base.data?.data.elections;

  const territorySlugs: TerritorySlug[] = elections
    ? ([
        "deutschland",
        "europa",
        ...Object.keys(elections).filter(
          (k) => k !== "deutschland" && k !== "europa",
        ),
      ] as TerritorySlug[])
    : [];

  const electionCount = elections
    ? Object.values(elections).reduce((n, list) => n + list.length, 0)
    : 0;

  return (
    <div className="ui container">
      <SEO title="Metawahl: Alle Wahlen im Überblick" />
      <div className="ui stackable two column padded relaxed grid electionList">
        <div className="row">
          <div className="four wide column headerCount2">
            <div className="headerCountInner">
              <div>{electionCount > 0 ? electionCount : 50}</div> Wahlen
            </div>
          </div>
          <div className="twelve wide column">
            <h3>Bundestags-, Landtags- und Europawahlen in der Übersicht</h3>
            <p>
              Diese Übersicht zeigt alle Wahlen, zu denen ein Wahl-o-Mat
              herausgegeben wurde. Das sind leider nicht alle Wahlen, seitdem
              dieses Tool für die Bundestagswahl 2002 das erste Mal produziert
              wurde. Zu Wahlen in Mecklenburg-Vorpommern gab es noch gar keine
              Ausgabe und auch einzelne andere Wahlen, wie die Landtagswahl in
              Niedersachsen 2017, sind hier nicht vertreten.
            </p>
          </div>
        </div>
        {elections &&
          territorySlugs.map((t) =>
            elections[t] ? (
              <TerritoryColumn key={t} territory={t} elections={elections[t]} />
            ) : null,
          )}
      </div>
    </div>
  );
}
