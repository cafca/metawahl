import { cn } from "@/lib/utils";

type WikidataLabelProps = {
  wikidata_id?: string | null;
  url?: string;
  className?: string;
};

/**
 * Small chip linking to a Wikidata entry. Shown on election and thesis
 * pages next to the title. Hidden entirely when there's no wikidata_id.
 */
export function WikidataLabel({ wikidata_id, url, className }: WikidataLabelProps) {
  if (wikidata_id == null || url == null) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent",
        className,
      )}
    >
      <img src="/img/Wikidata-logo.svg" alt="Wikidata logo" className="h-4 w-auto" />
      <span className="hidden md:inline">Wikidata</span>
    </a>
  );
}

type WikipediaLabelProps = {
  wikipedia_title?: string | null;
  wikipedia_url?: string | null;
  className?: string;
};

export function WikipediaLabel({
  wikipedia_title,
  wikipedia_url,
  className,
}: WikipediaLabelProps) {
  if (wikipedia_title == null && wikipedia_url == null) return null;
  const href =
    wikipedia_url == null
      ? `https://de.wikipedia.org/wiki/${wikipedia_title}`
      : wikipedia_url;
  const lastSepPos =
    wikipedia_url != null ? wikipedia_url.lastIndexOf("/") : -1;
  const title =
    wikipedia_title == null && wikipedia_url != null
      ? wikipedia_url.slice(lastSepPos + 1).replace(/_/g, " ")
      : (wikipedia_title ?? "");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent",
        className,
      )}
    >
      <span aria-hidden="true" className="font-bold">W</span>
      <span className="hidden md:inline">{decodeURIComponent(title)}</span>
    </a>
  );
}

export default WikidataLabel;
