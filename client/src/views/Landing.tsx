import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import logoUrl from "@/assets/logo.svg";
import { Map } from "@/components/Map";
import { SuggestionsGrid } from "@/components/SuggestionsGrid";
import { Button } from "@/components/ui/button";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";

const SUGGESTIONS = [
  {
    subTitle: "Quiz zur Wahl",
    title: "Wie gut kennst du Thüringen?",
    href: "/quiz/thueringen/49/",
  },
  {
    subTitle: "Alle Fragen aus der",
    title: "Bundestagswahl 2017",
    href: "/wahlen/deutschland/42/",
  },
  {
    subTitle: "5 Wahlen im Vergleich",
    title: "#Diesel",
    href: "/themen/dieselkraftstoff/",
  },
  {
    subTitle: "oder stöbere in weiteren",
    title: "600+ Themen",
    href: "/themen/",
  },
] as const;

export default function Landing() {
  const landtagSlugs = (Object.keys(TERRITORY_NAMES) as TerritorySlug[]).filter(
    (k) => k !== "deutschland" && k !== "europa",
  );
  const half = Math.ceil(landtagSlugs.length / 2);
  const firstHalf = landtagSlugs.slice(0, half);
  const secondHalf = landtagSlugs.slice(half);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <title>Metawahl</title>
      {/* Hero */}
      <section id="hero" className="my-16 grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div className="flex justify-center md:justify-start">
          <img src={logoUrl} alt="Metawahl Logo" className="max-h-20" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold leading-tight md:text-[32px]">
            Metawahl zeigt, wie sich der politische Konsens in Deutschland über
            Zeit ändert.
          </h1>
          <h2 className="mt-4 text-[15px] font-normal leading-relaxed text-ink-muted md:text-base">
            Hierzu werden die Aussagen der Parteien aus 50 Wahl-o-Maten mit den
            dazugehörigen Wahlergebnissen zusammengeführt. Es wird sichtbar,
            welche Politik von vielen Stimmen gestützt wird und welche Parteien
            dies möglich machen.
          </h2>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Von{" "}
            <a
              href="https://blog.vincentahrend.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-black/40 text-black/60"
            >
              Vincent Ahrend
            </a>
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href="/wahlen/thueringen/49">
                <ArrowRight />
                Thüringen 2019
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/quiz/thueringen/49">
                <ArrowRight />
                Quiz zu Thüringen
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/wahlen/">
                <ArrowRight />
                Alle Länder
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Wie Metawahl funktioniert */}
      <section className="my-12">
        <h2 className="mb-6 text-2xl font-bold">Wie Metawahl funktioniert</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              Parteien fordern unterschiedliche Politik
            </h3>
            <p className="mb-3">
              Bei Wahlen geben wir Parteien unsere Stimme, damit diese in
              unserem Namen Entscheidungen treffen. Jede Partei vertritt dabei
              unterschiedliche Positionen zu ausstehenden Entscheidungen.
            </p>
            <p>
              Vieles sehen die Parteien auch sehr ähnlich – aber in welchen
              Punkten unterscheiden sie sich eigentlich voneinander? Der
              Wahl-o-Mat der Bundeszentrale für politische Bildung ist enorm
              erfolgreich darin, uns zu zeigen, welche Fragen wir ihnen stellen
              können um sie klar voneinander zu trennen. Es stellt sich die
              Frage, welche Antworten auf diese Fragen die Mehrheit gewählt hat.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              Aber welche Politik hat die Wahl gewonnen?
            </h3>
            <p className="mb-3">
              Nach der Wahl wissen wir, welche Parteien die meisten Stimmen
              bekommen haben. Wenn Parteien und Positionen sich einfach in
              links und rechts teilen ließen, wäre damit auch klar, welche
              Positionen gewonnen haben.
            </p>
            <p>
              Aber was ist, wenn Parteien sich in vielen verschiedenen
              Richtungen gegenüberstehen? Wenn eine klassisch konservative
              Partei auch linke Postionen vertritt, oder eine klassisch linke
              Partei auch für konservative Interessen einsteht? Welche Politik
              hat jetzt die Mehrheit der Wählerstimmen bekommen? Genau das
              zeigt Metawahl für viele Wahlen in Deutschland, durch eine
              Verbindung der Fragen und Antworten aus dem Wahl-o-Mat mit den
              jeweiligen Wahlergebnissen.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">Oft unter einem Kompromiss</h3>
            <p className="mb-3">
              Die Position mit einer Mehrheit ist dabei nicht immer die, die
              von den meisten Wählern gewünscht wird. In einem repräsentativen
              Wahlsystem werden auch ungewünschte Positionen mit eingekauft,
              weil es nur eine begrenzte Anzahl an Parteien auf dem Wahlzettel
              gibt.
            </p>
            <p className="mb-3">
              <strong>
                Auf Metawahl findest du heraus, welche Positionen unter diesem
                Kompromiss eine Mehrheit der Wählerstimmen bekommen haben.
              </strong>
            </p>
            <p>
              In den Thesen spiegelt sich auch, wie sich die Position der Wähler
              – oder einer Partei – über die Zeit entwickelt hat, und wie
              unterschiedlich sie bei Wahlen in Europa, den Bundestags- und
              verschiedenen Landtagswahlen sein kann.
            </p>
          </div>
        </div>
      </section>

      {/* Alle Wahlen */}
      <section className="my-16">
        <h2 className="mb-8 text-2xl font-bold">
          <Link to="/wahlen" className="border-b border-black/40">
            Alle Wahlen
          </Link>
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/wahlen/deutschland/" className="block">
              <h3 className="mb-2 text-lg font-semibold">Deutschland</h3>
              <Map territory="deutschland" className="max-h-48" />
            </Link>
          </div>
          <div>
            <Link to="/wahlen/europa/" className="block">
              <h3 className="mb-2 text-lg font-semibold">Europa</h3>
              <Map territory="europa" className="max-h-48" />
            </Link>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Landtagswahlen</h3>
            <ul className="space-y-1">
              {firstHalf.map((k) => (
                <li key={k}>
                  <Link to={`/wahlen/${k}/`}>{TERRITORY_NAMES[k]}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">&nbsp;</h3>
            <ul className="space-y-1">
              {secondHalf.map((k) => (
                <li key={k}>
                  <Link to={`/wahlen/${k}/`}>{TERRITORY_NAMES[k]}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <SuggestionsGrid title="Und jetzt" sections={SUGGESTIONS} />
    </div>
  );
}
