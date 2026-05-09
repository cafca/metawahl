import { Link } from "react-router-dom";

import "./SuggestionsGrid.css";

export type SuggestionSection = {
  subTitle: string;
  title: string;
  href: string;
};

type SuggestionsGridProps = {
  title: string;
  sections: readonly SuggestionSection[];
};

export function SuggestionsGrid({ title, sections }: SuggestionsGridProps) {
  const cols = sections.length;
  const columnClass = ["", "one", "two", "three", "four", "five", "six"][cols] ?? "four";
  return (
    <div
      className={`ui stackable celled relaxed doubling ${columnClass} column grid suggestions hyphenate`}
    >
      <div className="row">
        <div className="column">
          <h2>
            <em>{title}</em>
          </h2>
        </div>
      </div>
      <div className="row">
        {sections.map((sect, i) => (
          <div className="column" key={`suggestion-grid-${i}`}>
            <Link to={sect.href}>
              <h2 className="ui header">
                <div className="sub header">{sect.subTitle}</div>
                <span className="suggestionText">{sect.title}</span>
              </h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuggestionsGrid;
