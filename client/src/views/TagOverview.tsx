import { Link } from "react-router-dom";

import SEO from "@/components/SEO";
import useBase from "@/hooks/useBase";
import type { Tag } from "@/types/api";

import "./TagOverview.css";

function sortByThesisCount(a: Tag, b: Tag): number {
  const ac = a.thesis_count ?? 0;
  const bc = b.thesis_count ?? 0;
  if (ac === bc) return a.slug < b.slug ? -1 : 1;
  return ac > bc ? -1 : 1;
}

export default function TagOverview() {
  const base = useBase();
  const tags = base.data?.data.tags ?? [];
  const isLoading = base.isLoading;

  const tagBySlug = (slug: string): Tag | undefined =>
    tags.find((t) => t.slug === slug);

  const rootTags = tags
    .filter((t) => t.root === true)
    .filter((t) => (t.thesis_count ?? 0) >= 10)
    .sort(sortByThesisCount);

  const tagElems = rootTags.map((tag, i) => {
    const linked = tag.related_tags?.linked;
    const relatedItems = linked
      ? Object.keys(linked)
          .filter(
            (k) => rootTags.filter((t) => t.title === k).length === 0,
          )
          .map((k) => {
            const entry = linked[k]!;
            const tagRef = "tag" in entry ? entry.tag : undefined;
            const slug =
              typeof tagRef === "string"
                ? tagRef
                : tagRef?.slug ?? "";
            const base = tagBySlug(slug);
            return base
              ? { ...base, thesis_count: entry.count }
              : { slug, title: slug, thesis_count: entry.count };
          })
          .sort(sortByThesisCount)
          .slice(0, 5)
          .map((entry, j) => (
            <div key={`${i}-${j}`} className="item">
              <i className="hashtag icon" />
              <div className="content">
                <a href={`/themen/${entry.slug}/`}>{entry.title}</a>
              </div>
            </div>
          ))
      : null;

    return (
      <div key={i} className="column revealMe">
        <h1 className="ui header ellipsis">
          <a href={`/themen/${tag.slug}/`}>{tag.title}</a>
        </h1>
        <a href={`/themen/${tag.slug}/`}>
          <div className="visible">
            <p
              className="thesesCount"
              style={{
                fontFamily: "Roboto, Helvetica, Arial, sans-serif",
              }}
            >
              {tag.thesis_count}
            </p>
          </div>
        </a>
        <div className="hidden">
          <div className="ui list">{relatedItems}</div>
          <a href={`/themen/${tag.slug}/`}>
            <i className="caret right icon" /> {tag.thesis_count} Thesen
            anschauen
          </a>
        </div>
      </div>
    );
  });

  return (
    <main className="ui container tagList app-main">
      <SEO title="Metawahl: Alle Wahlthemen in Deutschland seit 2002" />

      <div className="ui relaxed divided doubling stackable padded four column grid">
        <div className="row">
          <div className="four wide column headerCount">
            <div className="headerCountInner">
              <div>600+</div>
              Themen
            </div>
          </div>
          <div className="twelve wide column">
            <p>
              Über die Zuordnung zu über 600 Themen kannst du hier entdecken,
              wie sich politische Positionen von Wählern – oder auch Parteien –
              über Zeit geändert haben, und wie sie sich zwischen den
              verschiedenen Gebieten, in denen gewählt wird, unterscheiden.
            </p>
            <p>
              Auf dieser Seite findest du einen Überblick der Themenbereiche.
              Hinter jedem von ihnen verstecken sich viele weitere Unterthemen.
              Jedes Thema ist dabei einem Eintrag auf Wikidata zugeordnet –
              einer Sammlung strukturierter Daten, die mit Wikipedia verknüpft
              ist.
            </p>
            <p>
              Die Themenzuordnung ist ein laufender Prozess. Wenn du eine Idee
              für eine Ergänzung hast, kannst du bei jeder These unten rechts
              auf »melden« klicken, wir freuen uns über Vorschläge.
            </p>
            <p>
              <i className="caret right icon" />{" "}
              <a href="/themenliste/">Alle Themen als Liste zeigen</a>
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="row" style={{ height: "10em", textAlign: "center" }}>
            <div className="ui active centered inline loader" />
          </div>
        )}

        {tagElems}

        <div className="column">
          <Link to="/themenliste/">
            <h1>... und viele mehr</h1>
            <p>
              Viele weitere Themen sind in dieser Übersicht nicht enthalten.
              Klicke hier, um sie dir als Liste anzuschauen.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
