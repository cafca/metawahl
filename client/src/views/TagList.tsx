import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Hash } from "lucide-react";

import useBase from "@/hooks/useBase";
import type { Tag } from "@/types/api";
import { cn } from "@/lib/utils";

type SortMode = "count" | "name";

function sortByName(a: Tag, b: Tag): number {
  if (a.slug === b.slug) return sortByThesisCount(a, b);
  return a.slug < b.slug ? -1 : 1;
}

function sortByThesisCount(a: Tag, b: Tag): number {
  const countA = a.thesis_count ?? 0;
  const countB = b.thesis_count ?? 0;
  if (countA === countB) {
    return a.slug === b.slug ? 0 : a.slug < b.slug ? -1 : 1;
  }
  return countA > countB ? -1 : 1;
}

export default function TagList() {
  const { data, isLoading } = useBase();
  const [sortBy, setSortBy] = useState<SortMode>("count");
  const [showSingleTags, setShowSingleTags] = useState(false);

  const tags = useMemo(() => {
    const all = data?.data.tags ?? [];
    const filtered = showSingleTags
      ? all
      : all.filter((t) => (t.thesis_count ?? 0) > 1);
    const compare = sortBy === "name" ? sortByName : sortByThesisCount;
    return [...filtered].sort(compare);
  }, [data, sortBy, showSingleTags]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <title>Metawahl: Alle Wahlthemen in Deutschland seit 2002</title>

      <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold">
        <Hash className="size-7" aria-hidden="true" />
        Alle Themen
      </h1>

      <div className="mb-0 flex items-center gap-2 rounded-t-md border border-b-0 bg-muted/30 px-3 py-2">
        <SortPill
          label="alphabetisch"
          active={sortBy === "name"}
          onClick={() => setSortBy("name")}
        />
        <SortPill
          label="nach Anzahl Thesen"
          active={sortBy === "count"}
          onClick={() => setSortBy("count")}
        />
      </div>

      <div className="border bg-background p-4">
        {isLoading && (
          <p className="text-center text-sm text-muted-foreground">Lädt…</p>
        )}
        {tags.length > 0 && (
          <ul className="divide-y">
            {tags.map((tag) => (
              <li key={`tag-${tag.slug}`}>
                <Link
                  to={`/themen/${tag.slug}/`}
                  className="block px-2 py-3 hover:bg-accent"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">{tag.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {tag.thesis_count ?? 0}
                    </span>
                  </div>
                  {tag.description != null && tag.description.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tag.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-b-md border border-t-0 bg-muted/30 px-3 py-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showSingleTags}
            onChange={(e) => setShowSingleTags(e.target.checked)}
            className="size-4 rounded border-border"
          />
          Zeige auch Tags mit nur einer These
        </label>
      </div>
    </div>
  );
}

function SortPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {label}
    </button>
  );
}
