import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { WikidataLabel, WikipediaLabel } from "@/components/DataLabel";
import Legend from "@/components/Legend";
import SEO from "@/components/SEO";
import TagBadge from "@/components/TagBadge";
import Thesis from "@/components/Thesis";
import {
  TERRITORY_NAMES,
  THESES_PER_PAGE,
  type TerritorySlug,
} from "@/config";
import useBase from "@/hooks/useBase";
import useTag from "@/hooks/useTag";
import type {
  ElectionSummary,
  Tag,
  Thesis as ThesisData,
} from "@/types/api";

function extractTag(entry: unknown): Tag | undefined {
  if (entry == null || typeof entry !== "object") return undefined;
  const tag = (entry as { tag?: unknown }).tag;
  if (tag == null) return undefined;
  if (typeof tag === "string") return { slug: tag, title: tag };
  if (typeof tag === "object") return tag as Tag;
  return undefined;
}

function entryCount(entry: unknown): number {
  if (entry == null || typeof entry !== "object") return 0;
  const c = (entry as { count?: unknown }).count;
  return typeof c === "number" ? c : 0;
}

export default function TagView() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params.tag ?? "";
  const page = Number.parseInt(params.page ?? "1", 10) || 1;

  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [territoryFilter, setTerritoryFilter] = useState<TerritorySlug | null>(
    null,
  );
  const [invertFilter, setInvertFilter] = useState(false);

  const tagQuery = useTag(slug, page);
  const base = useBase();

  const tag = tagQuery.data?.data;
  const theses: ThesisData[] = useMemo(
    () => tagQuery.data?.theses ?? [],
    [tagQuery.data],
  );
  const electionsById: Record<string, ElectionSummary> = useMemo(
    () => tagQuery.data?.elections ?? {},
    [tagQuery.data],
  );
  const loading = tagQuery.isLoading;

  const electionDateById = useMemo(() => {
    const out: Record<number, string> = {};
    const all = base.data?.data.elections;
    if (!all) return out;
    Object.values(all)
      .flat()
      .forEach((e) => {
        out[e.id] = e.date;
      });
    return out;
  }, [base.data]);

  const territoryCounts = useMemo(() => {
    const counts: Partial<Record<TerritorySlug, number>> = {};
    (Object.keys(TERRITORY_NAMES) as TerritorySlug[]).forEach((k) => {
      counts[k] = 0;
    });
    theses.forEach((t) => {
      const el = electionsById[t.election_id];
      if (el) {
        const key = el.territory;
        counts[key] = (counts[key] ?? 0) + 1;
      }
    });
    return counts;
  }, [theses, electionsById]);

  const filteredTheses = useMemo(() => {
    if (loading) return [];
    return theses
      .filter((thesis) => {
        if (tagFilter == null) return true;
        const has = thesis.tags.some((t) => t.title === tagFilter);
        return invertFilter ? !has : has;
      })
      .filter((thesis) => {
        if (territoryFilter == null) return true;
        const el = electionsById[thesis.election_id];
        const match = el?.territory === territoryFilter;
        return invertFilter ? !match : match;
      })
      .sort((a, b) => {
        const da = electionDateById[a.election_id] ?? "";
        const db = electionDateById[b.election_id] ?? "";
        return db > da ? 1 : -1;
      });
  }, [
    loading,
    theses,
    tagFilter,
    territoryFilter,
    invertFilter,
    electionsById,
    electionDateById,
  ]);

  const startPos = (page - 1) * THESES_PER_PAGE;
  const endPos = Math.min(startPos + THESES_PER_PAGE, filteredTheses.length);
  const thesesElems = filteredTheses
    .slice(startPos, endPos)
    .map((thesis, i) => {
      const el = electionsById[thesis.election_id];
      if (!el) return null;
      return (
        <Thesis
          key={`Thesis-${thesis.id}`}
          election={el}
          linkElection={true}
          showHints={i === 0}
          {...thesis}
        />
      );
    });

  const parents = tag?.related_tags?.parents;
  const parentTags = parents
    ? Object.keys(parents)
        .map((k) => extractTag(parents[k]))
        .filter((t): t is Tag => t != null)
        .map((t) => <TagBadge key={t.slug} data={t} />)
    : [];

  const linkedTags = tag?.related_tags?.linked ?? {};
  const linkedKeys = Object.keys(linkedTags);
  const tagFilterOptions = linkedKeys
    .sort((a, b) => entryCount(linkedTags[b]) - entryCount(linkedTags[a]))
    .map((i) => {
      const t = extractTag(linkedTags[i]);
      return {
        key: i,
        title: t?.title ?? i,
        count: entryCount(linkedTags[i]),
      };
    });

  const territoryFilterOptions = (
    Object.keys(territoryCounts) as TerritorySlug[]
  )
    .filter((k) => (territoryCounts[k] ?? 0) > 0)
    .map((k) => ({
      key: k,
      text: TERRITORY_NAMES[k],
      count: territoryCounts[k] ?? 0,
    }));

  const pageTitle = tag?.title ?? "";
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTheses.length / THESES_PER_PAGE),
  );

  const goToPage = (p: number) => {
    navigate(`/themen/${slug}/${p}`);
  };

  return (
    <div
      className="ui container"
      id="outerContainer"
      style={{ minHeight: 350 }}
    >
      <SEO
        title={`Metawahl: Wahlthema ${pageTitle}`}
        canonical={`/themen/${slug}/`}
      />

      {tag == null && <div className="ui active centered inline loader" />}

      {tag?.wikidata_id && (
        <WikidataLabel wikidata_id={tag.wikidata_id} url={tag.url} />
      )}

      {tag?.wikipedia_title && (
        <WikipediaLabel
          wikipedia_title={tag.wikipedia_title}
          style={{ marginRight: "-10.5px" }}
        />
      )}

      <h1 className={`ui header${tag == null && !loading ? " disabled" : ""}`}>
        <i className="hashtag icon" />
        {tag && (
          <div className="content">
            {tag.title}
            {(tag.description || tag.aliases) && (
              <div className="sub header">
                {tag.description}
                {tag.description && tag.aliases && <br />}
                {tag.aliases && (
                  <span>
                    Auch:{" "}
                    {tag.aliases.map((a) => (
                      <span key={`alias-${a}`}>{a}, </span>
                    ))}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </h1>

      {parentTags.length > 0 && <h3>{parentTags}</h3>}

      {tagFilterOptions.length + territoryFilterOptions.length > 0 && (
        <div className="ui stackable menu">
          <div className="header item">Filter</div>

          <select
            className="ui dropdown link item"
            style={{ border: "none" }}
            value={tagFilter ?? ""}
            disabled={tagFilterOptions.length === 0}
            onChange={(e) => setTagFilter(e.target.value || null)}
          >
            <option value="">Nur mit Thema...</option>
            {tagFilterOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.title} ({o.count})
              </option>
            ))}
          </select>

          <select
            className="ui dropdown link item"
            style={{ border: "none" }}
            value={territoryFilter ?? ""}
            onChange={(e) =>
              setTerritoryFilter((e.target.value as TerritorySlug) || null)
            }
          >
            <option value="">Nur Gebiet...</option>
            {territoryFilterOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.text} ({o.count})
              </option>
            ))}
          </select>

          {(tagFilter != null || territoryFilter != null) && (
            <button
              type="button"
              className={`item${invertFilter ? " active" : ""}`}
              onClick={() => setInvertFilter((v) => !v)}
            >
              <i className="undo icon" /> Filter umkehren
            </button>
          )}
          {(tagFilter != null || territoryFilter != null) && (
            <button
              type="button"
              className="item"
              onClick={() => {
                setTagFilter(null);
                setTerritoryFilter(null);
                setInvertFilter(false);
              }}
            >
              <i className="close icon" /> Zurücksetzen
            </button>
          )}
        </div>
      )}

      {loading && <div className="ui active centered inline loader" />}

      {filteredTheses.length > 0 && tag && (
        <div style={{ marginTop: "3em" }}>
          {filteredTheses.length > THESES_PER_PAGE && (
            <h2 style={{ float: "right" }}>Seite {page}</h2>
          )}

          <h2>
            {filteredTheses.length} These
            {filteredTheses.length !== 1 && "n"} zu #{tag.title}
            {tagFilter != null && (
              <span>
                {" "}
                und {invertFilter && <em>nicht </em>}#{tagFilter}
              </span>
            )}
            {territoryFilter != null && (
              <span>
                {invertFilter
                  ? " außerhalb von Wahlen für "
                  : " in Wahlen für "}
                {TERRITORY_NAMES[territoryFilter]}
              </span>
            )}
          </h2>

          <Legend
            text="Legende:"
            genericVariation={true}
            preliminary={false}
            showMissing={false}
          />

          <div style={{ marginTop: "1.5em" }}>{thesesElems}</div>

          {totalPages > 1 && (
            <div className="ui pagination menu">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`item${p === page ? " active" : ""}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
