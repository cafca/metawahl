import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Hash } from "lucide-react";

import useBase from "@/hooks/useBase";
import type { Tag, RelatedTagEmbed, RelatedTagRef } from "@/types/api";

type LinkedEntry = { slug: string; title: string; count: number };

function sortByThesisCount(a: Tag, b: Tag): number {
  const countA = a.thesis_count ?? 0;
  const countB = b.thesis_count ?? 0;
  if (countA === countB) return a.slug < b.slug ? -1 : 1;
  return countA > countB ? -1 : 1;
}

function isEmbedded(
  entry: RelatedTagRef | RelatedTagEmbed,
): entry is RelatedTagEmbed {
  return typeof entry.tag !== "string";
}

function resolveLinkedEntries(
  tag: Tag,
  tagsBySlug: Map<string, Tag>,
  exclude: Set<string>,
): LinkedEntry[] {
  const linked = tag.related_tags?.linked;
  if (linked == null) return [];

  const resolved: LinkedEntry[] = [];
  for (const [key, entry] of Object.entries(linked)) {
    // Skip tags that are themselves root tags rendered as top-level cards.
    if (exclude.has(key)) continue;

    if (isEmbedded(entry)) {
      resolved.push({
        slug: entry.tag.slug,
        title: entry.tag.title,
        count: entry.count,
      });
    } else {
      // `entry.tag` is a slug string in base responses; look up details.
      const detail = tagsBySlug.get(entry.tag);
      if (detail == null) continue;
      resolved.push({
        slug: detail.slug,
        title: detail.title,
        count: entry.count,
      });
    }
  }

  resolved.sort((a, b) => {
    if (a.count === b.count) return a.slug < b.slug ? -1 : 1;
    return a.count > b.count ? -1 : 1;
  });
  return resolved.slice(0, 5);
}

export default function TagOverview() {
  const { data, isLoading } = useBase();

  const { rootTags, tagsBySlug, rootTitles } = useMemo(() => {
    const allTags = data?.data.tags ?? [];
    const slugMap = new Map<string, Tag>();
    for (const t of allTags) slugMap.set(t.slug, t);
    const roots = allTags
      .filter((t) => t.root === true)
      .filter((t) => (t.thesis_count ?? 0) >= 10)
      .slice()
      .sort(sortByThesisCount);
    const titles = new Set<string>(roots.map((t) => t.title));
    return { rootTags: roots, tagsBySlug: slugMap, rootTitles: titles };
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <title>Metawahl: Alle Wahlthemen in Deutschland seit 2002</title>

      <section className="mb-10 grid grid-cols-1 gap-6 border-b pb-8 md:grid-cols-4">
        <div className="flex items-center justify-center md:col-span-1">
          <div className="text-center">
            <div className="text-5xl font-bold leading-none">600+</div>
            <div className="mt-1 text-lg text-muted-foreground">Themen</div>
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="mb-3">
            Über die Zuordnung zu über 600 Themen kannst du hier entdecken, wie
            sich politische Positionen von Wählern – oder auch Parteien – über
            Zeit geändert haben, und wie sie sich zwischen den verschiedenen
            Gebieten, in denen gewählt wird, unterscheiden.
          </p>
          <p className="mb-3">
            Auf dieser Seite findest du einen Überblick der Themenbereiche.
            Hinter jedem von ihnen verstecken sich viele weitere Unterthemen.
            Jedes Thema ist dabei einem Eintrag auf Wikidata zugeordnet – einer
            Sammlung strukturierter Daten, die mit Wikipedia verknüpft ist.
          </p>
          <p className="mb-3">
            Die Themenzuordnung ist ein laufender Prozess. Wenn du eine Idee
            für eine Ergänzung hast, kannst du bei jeder These unten rechts auf
            »melden« klicken, wir freuen uns über Vorschläge.
          </p>
          <p>
            <ChevronRight className="inline size-4" aria-hidden="true" />{" "}
            <Link to="/themenliste/" className="underline">
              Alle Themen als Liste zeigen
            </Link>
          </p>
        </div>
      </section>

      {isLoading && (
        <p className="py-8 text-center text-muted-foreground">Lädt…</p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rootTags.map((tag) => {
          const related = resolveLinkedEntries(tag, tagsBySlug, rootTitles);
          return (
            <div
              key={`root-tag-${tag.slug}`}
              className="group flex flex-col gap-3 rounded-lg border p-5 transition-colors hover:bg-accent/40"
            >
              <h2 className="truncate text-2xl font-bold">
                <Link to={`/themen/${tag.slug}/`} className="hover:underline">
                  {tag.title}
                </Link>
              </h2>
              <Link
                to={`/themen/${tag.slug}/`}
                className="block text-4xl font-semibold text-muted-foreground group-hover:text-foreground"
              >
                {tag.thesis_count ?? 0}
              </Link>
              {related.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {related.map((entry) => (
                    <li
                      key={`${tag.slug}-linked-${entry.slug}`}
                      className="flex items-center gap-1"
                    >
                      <Hash className="size-3 text-muted-foreground" aria-hidden="true" />
                      <Link to={`/themen/${entry.slug}/`} className="hover:underline">
                        {entry.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to={`/themen/${tag.slug}/`}
                className="mt-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
                {tag.thesis_count ?? 0} Thesen anschauen
              </Link>
            </div>
          );
        })}

        <Link
          to="/themenliste/"
          className="flex flex-col justify-center gap-3 rounded-lg border border-dashed p-5 transition-colors hover:bg-accent/40"
        >
          <h2 className="text-2xl font-bold">... und viele mehr</h2>
          <p className="text-sm text-muted-foreground">
            Viele weitere Themen sind in dieser Übersicht nicht enthalten.
            Klicke hier, um sie dir als Liste anzuschauen.
          </p>
        </Link>
      </div>
    </div>
  );
}
