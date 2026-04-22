import { useEffect, useMemo, useRef, useState } from "react";
import { Hash } from "lucide-react";
import wikidata from "wikidata-sdk";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { IS_ADMIN } from "@/config";
import { cn } from "@/lib/utils";

export type WikidataMatch = {
  id: string;
  label: string;
  description: string;
  concepturi: string;
};

/**
 * Raw shape of an entry in the Wikidata `wbsearchentities` response's
 * `search` array. Only the fields we consume are typed.
 */
interface WikidataSearchEntry {
  id: string;
  label?: string;
  description?: string;
  concepturi?: string;
  url?: string;
  title?: string;
}

interface WikidataSearchResponse {
  success: 0 | 1;
  search?: WikidataSearchEntry[];
  error?: unknown;
}

const SEARCH_LANGUAGE = "de";
const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 3;

type WikidataTaggerProps = {
  onSelection: (match: WikidataMatch) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Admin-only Wikidata autocomplete. Typing a query (3+ chars) hits
 * `wbsearchentities` via `wikidata-sdk`, lists results, and emits a
 * `{ id, label, description, concepturi }` record on select.
 *
 * Renders `null` when the `IS_ADMIN` flag is off, so the component is safe
 * to import from non-admin surfaces.
 */
export function WikidataTagger({
  onSelection,
  placeholder = "Tag hinzufügen",
  className,
}: WikidataTaggerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WikidataMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useMemo(() => query.trim(), [query]);
  const tooShort = debouncedQuery.length < MIN_QUERY_LENGTH;

  useEffect(() => {
    // Cancel any in-flight timer / request whenever the query changes.
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (abortRef.current != null) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    if (tooShort) {
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const url = wikidata.searchEntities({
          search: debouncedQuery,
          language: SEARCH_LANGUAGE,
          limit: 5,
        });
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = (await response.json()) as WikidataSearchResponse;
        if (payload.success !== 1 || payload.search == null) {
          setResults([]);
          return;
        }
        setResults(
          payload.search.map((entry) => ({
            id: entry.id,
            label: entry.label ?? entry.title ?? entry.id,
            description: entry.description ?? "",
            concepturi:
              entry.concepturi ??
              entry.url ??
              `https://www.wikidata.org/wiki/${entry.id}`,
          })),
        );
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") return;
        console.error("WikidataTagger search failed", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [debouncedQuery, tooShort]);

  // Display derived from inputs: below the min-length threshold we never show
  // stale results, regardless of what's still sitting in `results`.
  const visibleResults = tooShort ? [] : results;
  const showLoading = !tooShort && isLoading;

  if (!IS_ADMIN) return null;

  const showEmpty = !showLoading && !tooShort && visibleResults.length === 0;

  return (
    <Command
      className={cn(
        "rounded-md border border-border bg-background shadow-sm",
        className,
      )}
      shouldFilter={false}
    >
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {showLoading && (
          <div className="px-3 py-2 text-sm text-muted-foreground">Lädt…</div>
        )}
        {showEmpty && <CommandEmpty>Keine Treffer</CommandEmpty>}
        {visibleResults.length > 0 && (
          <CommandGroup heading="Wikidata">
            {visibleResults.map((hit) => (
              <CommandItem
                key={hit.id}
                value={`${hit.label} ${hit.id}`}
                onSelect={() => {
                  onSelection(hit);
                  setQuery("");
                  setResults([]);
                }}
              >
                <Hash className="size-4 text-muted-foreground" aria-hidden />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium">{hit.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {hit.id}
                    </span>
                  </div>
                  {hit.description.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {hit.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}

export default WikidataTagger;
