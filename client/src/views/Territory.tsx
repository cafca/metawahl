import { Link, useParams } from "react-router-dom";

import Map from "@/components/Map";
import SEO from "@/components/SEO";
import useBase from "@/hooks/useBase";
import useIsMobile from "@/hooks/useIsMobile";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import { formatLongGerman, yearOf } from "@/lib/dates";

function titleBeforeSpace(title: string): string {
  const i = title.indexOf(" ");
  return i === -1 ? title : title.slice(0, i);
}

export default function Territory() {
  const params = useParams();
  const slug = (params.territory ?? "deutschland") as TerritorySlug;
  const isMobile = useIsMobile(600);

  const base = useBase();
  const elections = base.data?.data.elections[slug];

  const territoryName = TERRITORY_NAMES[slug] ?? slug;

  const items = elections
    ? elections
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((election) => (
          <a
            key={election.id}
            href={`/wahlen/${election.territory}/${election.id}/`}
            className="item electionListItem"
          >
            <div className="content">
              <h3 className="header">{yearOf(election.date)}</h3>
              <span style={{ color: "rgb(140, 140, 140)" }}>
                {titleBeforeSpace(election.title)} vom{" "}
                {formatLongGerman(election.date)}
              </span>
            </div>
          </a>
        ))
    : null;

  const mapColumnClass = isMobile ? "six wide column" : "four wide column";

  return (
    <div className="ui container" id="outerContainer">
      <SEO title={`Metawahl: Alle Wahlthemen in ${territoryName}`} />

      <div className="ui breadcrumb">
        <a className="section" href="/wahlen/">Wahlen</a>
        <i className="right angle icon divider" />
        <a className="section" href={`/wahlen/${slug}/`}>{territoryName}</a>
      </div>

      <h1 className="ui dividing header">
        <Link to={`/wahlen/${slug}/`}>Wahlen in {territoryName}</Link>
      </h1>

      <div className="ui two column grid">
        <div className={mapColumnClass}>
          <Map territory={slug} style={{ maxHeight: "10em" }} />
        </div>
        <div className="ten wide column">
          <div className="ui very relaxed list">{items}</div>
        </div>
      </div>
    </div>
  );
}
