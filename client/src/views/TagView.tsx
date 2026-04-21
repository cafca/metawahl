import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";

import { Legend } from "@/components/Legend";
import { TagBadge } from "@/components/TagBadge";
import { Thesis as ThesisCard } from "@/components/Thesis";
import { Button } from "@/components/ui/button";
import { THESES_PER_PAGE } from "@/config";
import useTag from "@/hooks/useTag";
import type {
  RelatedTagEmbed,
  RelatedTagRef,
  Tag,
  TagDetailResponse,
} from "@/types/api";

function isEmbedded(
  entry: RelatedTagRef | RelatedTagEmbed,
): entry is RelatedTagEmbed {
  return typeof entry.tag !== "string";
}

function collectRelatedTags(
  tag: TagDetailResponse["data"] | undefined,
  key: "linked" | "parents",
): Array<{ tag: Tag; count: number }> {
  const bucket = tag?.related_tags?.[key];
  if (bucket == null) return [];
  const out: Array<{ tag: Tag; count: number }> = [];
  for (const entry of Object.values(bucket)) {
    if (isEmbedded(entry)) {
      out.push({ tag: entry.tag, count: entry.count });
    }
  }
  out.sort((a, b) => b.count - a.count);
  return out;
}

export default function TagView() {
  const { tag: slug, page } = useParams<{ tag: string; page?: string }>();
  const currentPage = useMemo(() => {
    const n = Number.parseInt(page ?? "1", 10);
    return Number.isNaN(n) || n < 1 ? 1 : n;
  }, [page]);

  const safeSlug = slug ?? "";
  const query = useTag(safeSlug, currentPage);
  const { data, isLoading, isError } = query;

  const tag = data?.data;
  const theses = useMemo(() => data?.theses ?? [], [data]);
  const elections = useMemo(() => data?.elections ?? {}, [data]);

  const sortedTheses = useMemo(() => {
    if (theses.length === 0) return theses;
    return [...theses].sort((a, b) => {
      const dateA = elections[String(a.election_id)]?.date ?? "";
      const dateB = elections[String(b.election_id)]?.date ?? "";
      if (dateA === dateB) return 0;
      return dateA > dateB ? -1 : 1;
    });
  }, [theses, elections]);

  const totalThesisCount = tag?.thesis_count ?? sortedTheses.length;
  const totalPages = Math.max(1, Math.ceil(totalThesisCount / THESES_PER_PAGE));

  const parentTags = useMemo(() => collectRelatedTags(tag, "parents"), [tag]);
  const linkedTags = useMemo(() => collectRelatedTags(tag, "linked"), [tag]);

  const pageTitle =
    tag?.title != null ? `Metawahl: Wahlthema ${tag.title}` : "Metawahl";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <title>{pageTitle}</title>

      {isLoading && !tag && (
        <p className="py-12 text-center text-muted-foreground">Lädt…</p>
      )}

      {isError && (
        <p className="py-6 text-center text-destructive">
          Fehler beim Laden des Themas.
        </p>
      )}

      {tag != null && (
        <>
          <header className="mb-6">
            <h1 className="flex items-center gap-2 text-3xl font-bold md:text-4xl">
              <Hash className="size-7" aria-hidden="true" />
              {tag.title}
            </h1>
            {(tag.description != null || tag.aliases != null) && (
              <div className="mt-2 text-muted-foreground">
                {tag.description != null && <p>{tag.description}</p>}
                {tag.aliases != null && tag.aliases.length > 0 && (
                  <p className="mt-1 text-sm">
                    Auch: {tag.aliases.join(", ")}
                  </p>
                )}
              </div>
            )}
          </header>

          {parentTags.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-1">
              {parentTags.map(({ tag: parent }) => (
                <TagBadge key={`parent-${parent.slug}`} tag={parent} />
              ))}
            </div>
          )}

          {sortedTheses.length > 0 && (
            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">
                  {totalThesisCount} These{totalThesisCount !== 1 && "n"} zu #
                  {tag.title}
                </h2>
                {totalPages > 1 && (
                  <p className="text-sm text-muted-foreground">
                    Seite {currentPage} von {totalPages}
                  </p>
                )}
              </div>

              <Legend text="Legende:" genericVariation className="mb-6" />

              <div className="space-y-4">
                {sortedTheses.map((thesis) => (
                  <ThesisCard
                    key={`thesis-${thesis.id}`}
                    thesis={thesis}
                    election={elections[String(thesis.election_id)]}
                    linkElection
                    showChart={false}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav
                  className="mt-8 flex items-center justify-between"
                  aria-label="Seiten"
                >
                  {currentPage > 1 ? (
                    <Button variant="outline" asChild>
                      <Link
                        to={`/themen/${tag.slug}/${currentPage - 1}/`}
                      >
                        <ChevronLeft /> Vorherige Seite
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                  {currentPage < totalPages ? (
                    <Button variant="outline" asChild>
                      <Link
                        to={`/themen/${tag.slug}/${currentPage + 1}/`}
                      >
                        Nächste Seite <ChevronRight />
                      </Link>
                    </Button>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </section>
          )}

          {linkedTags.length > 0 && (
            <section className="mt-10 border-t pt-6">
              <h2 className="mb-3 text-lg font-semibold">Verwandte Themen</h2>
              <div className="flex flex-wrap">
                {linkedTags.map(({ tag: linked, count }) => (
                  <TagBadge
                    key={`linked-${linked.slug}`}
                    tag={linked}
                    detail={count}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
