import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import type { Tag } from "@/types/api";

type TagBadgeProps = {
  tag: Tag;
  active?: boolean;
  detail?: string | number;
  className?: string;
  onClick?: () => void;
};

/**
 * Pill/label representation of a tag. Renders as a Link to the tag detail
 * page when no `onClick` is provided; otherwise renders as a button so the
 * caller can handle the click.
 */
export function TagBadge({ tag, active, detail, className, onClick }: TagBadgeProps) {
  const baseClasses = cn(
    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm transition-colors",
    "mr-1.5 mb-1.5 hover:bg-accent",
    active
      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
      : "border-border bg-background text-foreground",
    className,
  );

  const content = (
    <>
      <span aria-hidden="true">#</span>
      <span>{tag.title}</span>
      {detail != null && (
        <span className="ml-1 text-xs text-muted-foreground">{detail}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={baseClasses}
        onClick={onClick}
        title={tag.description ?? undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={`/themen/${tag.slug}/`}
      className={baseClasses}
      title={tag.description ?? undefined}
    >
      {content}
    </Link>
  );
}

export default TagBadge;
