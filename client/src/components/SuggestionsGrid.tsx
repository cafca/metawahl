import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SuggestionSection = {
  subTitle: string;
  title: string;
  href: string;
};

type SuggestionsGridProps = {
  title: string;
  sections: readonly SuggestionSection[];
  className?: string;
};

export function SuggestionsGrid({ title, sections, className }: SuggestionsGridProps) {
  return (
    <section className={cn("mt-16 mb-4 hyphens-auto", className)}>
      <h2 className="mb-6 text-[1.71428571rem] font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((sect, i) => (
          <Link
            key={`suggestion-grid-${i}`}
            to={sect.href}
            className="group block h-full"
          >
            <Card className="h-full justify-center px-6 transition-colors hover:bg-accent">
              <div className="text-sm text-muted-foreground">{sect.subTitle}</div>
              <div className="mt-1 text-lg font-semibold group-hover:underline">
                {sect.title}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default SuggestionsGrid;
