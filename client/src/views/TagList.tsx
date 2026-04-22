import { useState } from "react";

import SEO from "@/components/SEO";
import useBase from "@/hooks/useBase";
import type { Tag } from "@/types/api";

type Sorting = "count" | "name";

function sortByName(a: Tag, b: Tag): number {
  if (a.slug === b.slug) return sortByThesisCount(a, b);
  return a.slug < b.slug ? -1 : 1;
}

function sortByThesisCount(a: Tag, b: Tag): number {
  const ac = a.thesis_count ?? 0;
  const bc = b.thesis_count ?? 0;
  if (ac === bc) return sortByName(a, b);
  return ac > bc ? -1 : 1;
}

export default function TagList() {
  const [showSingle, setShowSingle] = useState(false);
  const [sortBy, setSortBy] = useState<Sorting>("count");

  const base = useBase();
  const tags = base.data?.data.tags ?? [];
  const isLoading = base.isLoading;

  const tagElems = tags
    .filter((t) => (showSingle ? true : (t.thesis_count ?? 0) > 1))
    .sort(sortBy === "name" ? sortByName : sortByThesisCount)
    .map((tag, i) => (
      <a key={`Tag-${i}`} href={`/themen/${tag.slug}/`} className="item">
        <div className="content">
          <div className="header">
            {tag.title}
            <span style={{ color: "rgba(0,0,0,.4)" }}>
              &nbsp; {tag.thesis_count}
            </span>
          </div>
          {tag.description && tag.description.length > 0 && (
            <div className="description">{tag.description}</div>
          )}
        </div>
      </a>
    ));

  return (
    <div className="ui container" id="outerContainer">
      <SEO title="Metawahl: Alle Wahlthemen in Deutschland seit 2002" />

      <h1 className="ui header">
        <i className="hashtag icon" />
        <div className="content">Alle Themen</div>
      </h1>

      <div className="ui top attached pointing menu">
        <button
          type="button"
          className={`item${sortBy === "name" ? " active" : ""}`}
          onClick={() => setSortBy("name")}
        >
          alphabetisch
        </button>
        <button
          type="button"
          className={`item${sortBy === "count" ? " active" : ""}`}
          onClick={() => setSortBy("count")}
        >
          nach Anzahl Thesen
        </button>
      </div>

      <div className="ui attached segment">
        {isLoading && <div className="ui active centered inline loader" />}
        {tagElems.length > 0 && (
          <div className="ui link divided items">{tagElems}</div>
        )}
      </div>

      <div className="ui bottom attached segment">
        <div className="ui toggle checkbox">
          <input
            type="checkbox"
            checked={showSingle}
            onChange={(e) => setShowSingle(e.target.checked)}
            id="single-tags-toggle"
          />
          <label htmlFor="single-tags-toggle">
            Zeige auch Tags mit nur einer These
          </label>
        </div>
      </div>
    </div>
  );
}
