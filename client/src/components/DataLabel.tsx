import type { CSSProperties } from "react";

import "./DataLabel.css";

type WikidataProps = {
  wikidata_id: string | null | undefined;
  url?: string;
};

export function WikidataLabel({ wikidata_id, url }: WikidataProps) {
  if (wikidata_id == null) return null;
  return (
    <div
      className="ui right floated header"
      style={{ marginRight: "-10.5px" }}
    >
      <a
        className="ui basic image label wikidataLabel"
        href={url}
      >
        <img src="/img/Wikidata-logo.svg" alt="Wikidata logo" />
        <span className="wikidata-label-text">Wikidata</span>
      </a>
    </div>
  );
}

type WikipediaProps = {
  wikipedia_title?: string | null;
  wikipedia_url?: string | null;
  style?: CSSProperties;
};

export function WikipediaLabel({
  wikipedia_title,
  wikipedia_url,
  style,
}: WikipediaProps) {
  if (wikipedia_title == null && wikipedia_url == null) return null;

  const href =
    wikipedia_url == null
      ? "https://de.wikipedia.org/wiki/" + wikipedia_title
      : wikipedia_url;

  const lastSepPos = wikipedia_url ? wikipedia_url.lastIndexOf("/") : -1;
  const title =
    wikipedia_title == null
      ? (wikipedia_url ?? "").slice(lastSepPos).replace("_", " ")
      : wikipedia_title;

  if (wikipedia_title == null) return null;

  return (
    <div className="ui right floated header" style={style}>
      <a className="ui basic image label" href={href}>
        <i className="wikipedia w icon" />
        <span className="wikidata-label-text"> {decodeURIComponent(title)}</span>
      </a>
    </div>
  );
}
