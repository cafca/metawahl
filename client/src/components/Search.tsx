import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Fuse, { type IFuseOptions } from "fuse.js";

import useBase from "@/hooks/useBase";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import type { Tag } from "@/types/api";

type TerritoryEntry = {
  title: string;
  alias: string | null;
  slug: TerritorySlug;
  kind: "territory";
};

const territoryAliases: Partial<Record<TerritorySlug, string>> = {
  deutschland: "Bundestag",
};

const territoryList: TerritoryEntry[] = (
  Object.keys(TERRITORY_NAMES) as TerritorySlug[]
).map((k) => ({
  title: TERRITORY_NAMES[k],
  alias: territoryAliases[k] ?? null,
  slug: k,
  kind: "territory",
}));

const tagSearchOptions: IFuseOptions<Tag> = {
  threshold: 0.2,
  distance: 300,
  minMatchCharLength: 3,
  includeScore: true,
  keys: [
    { name: "title", weight: 1 },
    { name: "description", weight: 0.03 },
    { name: "aliases", weight: 0.1 },
  ],
};

const territorySearchOptions: IFuseOptions<TerritoryEntry> = {
  threshold: 0.2,
  distance: 30,
  minMatchCharLength: 2,
  keys: ["title", "alias"],
};

type SearchProps = {
  className?: string;
  large?: boolean;
};

export function Search({ className = "", large = false }: SearchProps) {
  const navigate = useNavigate();
  const { data } = useBase();
  const tags = useMemo(() => data?.data.tags ?? [], [data]);

  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const tagSearch = useMemo(() => new Fuse(tags, tagSearchOptions), [tags]);
  const territorySearch = useMemo(
    () => new Fuse(territoryList, territorySearchOptions),
    [],
  );

  const { tagResults, territoryResults } = useMemo(() => {
    if (query.length === 0) {
      return {
        tagResults: [] as Tag[],
        territoryResults: [] as TerritoryEntry[],
      };
    }

    const territoryHits = territorySearch
      .search(query)
      .slice(0, 3)
      .map((r) => r.item);

    let tagHits: Tag[] = [];
    if (query.length < 3) {
      const lower = query.toLowerCase();
      tagHits = tags
        .filter((t) => t.title?.toLowerCase().startsWith(lower))
        .sort((a, b) => (b.thesis_count ?? 0) - (a.thesis_count ?? 0));
    }

    if (query.length >= 3 || tagHits.length === 0) {
      const scored = tagSearch.search(query);
      tagHits = scored
        .slice()
        .sort((a, b) => {
          const sa = (a.item.thesis_count ?? 0) / (a.score || 0.0001);
          const sb = (b.item.thesis_count ?? 0) / (b.score || 0.0001);
          return sb - sa;
        })
        .map((r) => r.item);
    }

    return {
      tagResults: tagHits.slice(0, 10),
      territoryResults: territoryHits,
    };
  }, [query, tagSearch, territorySearch, tags]);

  useEffect(() => {
    if (query.length === 0) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [query]);

  const handleSelect = (href: string) => {
    setQuery("");
    navigate(href);
  };

  const resultClassName =
    "results transition" + (query.length === 0 ? "" : " visible");

  return (
    <div
      ref={containerRef}
      className={`ui category search ${className}`.trim()}
    >
      <div className="ui icon input searchNoBorder">
        <input
          aria-label="Suche"
          className="prompt"
          type="text"
          placeholder="Alles ist möglich..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ borderRadius: 4 }}
        />
        <i className="search icon" />
      </div>
      <div
        className={resultClassName}
        style={large ? { fontSize: 14 } : undefined}
      >
        {territoryResults.length > 0 && (
          <div className="category">
            <div className="name" style={{ marginTop: 7 }}>
              Gebiete
            </div>
            {territoryResults.map((res) => (
              <a
                className="result"
                key={`result-territory-${res.slug}`}
                href={`/wahlen/${res.slug}/`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(`/wahlen/${res.slug}/`);
                }}
              >
                <div className="content">
                  <div className="title">{res.title}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {tagResults.length > 0 && (
          <div className="category">
            <div className="name" style={{ marginTop: 7 }}>
              Themen
            </div>
            {tagResults.map((res) => (
              <span
                className="result"
                key={`result-tag-${res.slug}`}
                onClick={() => handleSelect(`/themen/${res.slug}/`)}
              >
                <div className="content">
                  <div className="title">
                    {res.title}
                    <span
                      style={{ color: "rgba(0, 0, 0, 0.3)", float: "right" }}
                    >
                      &nbsp; {res.thesis_count}
                    </span>
                  </div>
                  {res.description && (
                    <div className="description">{res.description}</div>
                  )}
                </div>
              </span>
            ))}
          </div>
        )}

        {query.length > 0 &&
          tagResults.length + territoryResults.length === 0 && (
            <div className="message empty">
              <div className="header">Keine Suchergebnisse</div>
              <div className="description">
                Leider wurden keine Themen oder Parlamente zu deiner Anfrage
                gefunden
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default Search;
