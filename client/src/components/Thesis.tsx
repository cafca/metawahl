import { Link } from "react-router-dom";

import { TagBadge } from "@/components/TagBadge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Election, Thesis as ThesisModel } from "@/types/api";
import { extractThesisId } from "@/lib/thesis";

type ThesisProps = {
  thesis: ThesisModel;
  election?: Election;
  linkElection?: boolean;
  hideTags?: boolean;
  className?: string;
};

/**
 * Minimal thesis card used by tag detail + list views.
 *
 * NOTE: The rich position chart, quiz widget and admin tooling from the
 * legacy component are intentionally deferred to a later phase; this
 * version shows the thesis text, a link to the election and the thesis's
 * tags.
 */
export function Thesis({
  thesis,
  election,
  linkElection = false,
  hideTags = false,
  className,
}: ThesisProps) {
  const ids = extractThesisId(thesis.id);
  const permaLink =
    election != null && ids != null
      ? `/wahlen/${election.territory}/${ids.womId}/${ids.thesisNum}/`
      : null;

  const sortedTags = [...thesis.tags].sort((a, b) =>
    a.slug > b.slug ? 1 : -1,
  );

  return (
    <Card className={cn("gap-3 py-5", className)}>
      <div className="px-6">
        {linkElection && election != null && (
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            {election.title}
          </p>
        )}
        {permaLink != null ? (
          <Link to={permaLink} className="block">
            <h2 className="text-lg font-semibold leading-snug hover:underline">
              {thesis.text}
            </h2>
          </Link>
        ) : (
          <h2 className="text-lg font-semibold leading-snug">{thesis.text}</h2>
        )}
      </div>

      {!hideTags && sortedTags.length > 0 && (
        <div className="flex flex-wrap px-6">
          {sortedTags.map((tag) => (
            <TagBadge key={`thesis-${thesis.id}-tag-${tag.slug}`} tag={tag} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default Thesis;
