import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import Fuse from "fuse.js";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import type { ElectionSummary, Tag } from "@/types/api";
import { cn } from "@/lib/utils";

// Unified shape fed into Fuse so we can search across elections + tags in one
// pass. Results are discriminated on `kind`.
type ElectionHit = {
  kind: "election";
  key: string;
  title: string;
  subtitle: string;
  href: string;
};

type TagHit = {
  kind: "tag";
  key: string;
  title: string;
  description?: string;
  aliases?: string[];
  thesis_count: number;
  href: string;
};

type SearchHit = ElectionHit | TagHit;

const fuseOptions = {
  threshold: 0.2,
  distance: 300,
  includeScore: true,
  minMatchCharLength: 2,
  keys: [
    { name: "title", weight: 1 },
    { name: "aliases", weight: 0.1 },
    { name: "description", weight: 0.03 },
    { name: "subtitle", weight: 0.2 },
  ],
};

function buildElectionHits(
  elections?: Record<TerritorySlug, ElectionSummary[]>,
): ElectionHit[] {
  if (elections == null) return [];
  const hits: ElectionHit[] = [];
  for (const slug of Object.keys(elections) as TerritorySlug[]) {
    const bucket = elections[slug] ?? [];
    for (const e of bucket) {
      hits.push({
        kind: "election",
        key: `election-${slug}-${e.id}`,
        title: e.title,
        subtitle: TERRITORY_NAMES[slug],
        href: `/wahlen/${slug}/${e.id}/`,
      });
    }
  }
  return hits;
}

function buildTagHits(tags?: Tag[]): TagHit[] {
  if (tags == null) return [];
  return tags.map((t) => ({
    kind: "tag",
    key: `tag-${t.slug}`,
    title: t.title,
    description: t.description,
    aliases: t.aliases,
    thesis_count: t.thesis_count ?? 0,
    href: `/themen/${t.slug}/`,
  }));
}

type SearchProps = {
  /**
   * When provided, these override the values resolved from `useBase()`. Useful
   * for callers that already hold the base payload.
   */
  elections?: Record<TerritorySlug, ElectionSummary[]>;
  tags?: Tag[];
  /** Render mode: "button" opens a `<CommandDialog>`, "inline" shows the palette flat. */
  variant?: "button" | "inline";
  /** Extra classes applied to the outer trigger. */
  className?: string;
};

/**
 * Fuzzy search over elections + tags. Keyboard-navigable via shadcn's
 * cmdk-backed Command palette; Cmd/Ctrl+K opens the dialog when used with
 * `variant="button"`.
 */
export function Search({
  elections,
  tags,
  variant = "button",
  className,
}: SearchProps) {
  const { data } = useBase();
  const resolvedElections = elections ?? data?.data.elections;
  const resolvedTags = tags ?? data?.data.tags;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const electionHits = useMemo(
    () => buildElectionHits(resolvedElections),
    [resolvedElections],
  );
  const tagHits = useMemo(() => buildTagHits(resolvedTags), [resolvedTags]);

  const fuse = useMemo(
    () => new Fuse<SearchHit>([...electionHits, ...tagHits], fuseOptions),
    [electionHits, tagHits],
  );

  const results = useMemo<{
    elections: ElectionHit[];
    tags: TagHit[];
  }>(() => {
    const q = query.trim();
    if (q.length === 0) {
      return { elections: [], tags: [] };
    }
    const hits = fuse
      .search(q)
      .slice(0, 20)
      .map((r) => r.item);
    const electionResults = hits.filter(
      (h): h is ElectionHit => h.kind === "election",
    );
    const tagResults = hits.filter((h): h is TagHit => h.kind === "tag");
    return { elections: electionResults, tags: tagResults.slice(0, 10) };
  }, [fuse, query]);

  // Global Cmd/Ctrl+K shortcut.
  useEffect(() => {
    if (variant !== "button") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variant]);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    navigate(href);
  }

  const palette = (
    <>
      <CommandInput
        placeholder="Suche nach Wahlen und Themen…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query.trim().length > 0 && (
          <CommandEmpty>Keine Suchergebnisse</CommandEmpty>
        )}
        {results.elections.length > 0 && (
          <CommandGroup heading="Wahlen">
            {results.elections.map((hit) => (
              <CommandItem
                key={hit.key}
                value={`${hit.title} ${hit.subtitle} ${hit.key}`}
                onSelect={() => handleSelect(hit.href)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{hit.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {hit.subtitle}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results.tags.length > 0 && (
          <CommandGroup heading="Themen">
            {results.tags.map((hit) => (
              <CommandItem
                key={hit.key}
                value={`${hit.title} ${hit.key}`}
                onSelect={() => handleSelect(hit.href)}
              >
                <div className="flex flex-1 items-baseline justify-between gap-2">
                  <span className="font-medium">{hit.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {hit.thesis_count}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </>
  );

  if (variant === "inline") {
    return (
      <Command
        className={cn(
          "rounded-md border border-border bg-background shadow-sm",
          className,
        )}
        shouldFilter={false}
      >
        {palette}
      </Command>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("gap-2 text-muted-foreground", className)}
        aria-label="Suche öffnen"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Suche…</span>
        <kbd className="ml-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          {navigator.platform.toLowerCase().includes("mac") ? "⌘K" : "Ctrl+K"}
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Suche"
        description="Suche nach Wahlen und Themen"
        shouldFilter={false}
      >
        {palette}
      </CommandDialog>
    </>
  );
}

export default Search;
