import { Link } from "react-router-dom";

import Logo from "@/assets/logo.svg?react";
import Map from "@/components/Map";
import SuggestionsGrid from "@/components/SuggestionsGrid";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";

import "./Landing.css";

export default function Landing() {
  const landtagSlugs = (Object.keys(TERRITORY_NAMES) as TerritorySlug[]).filter(
    (k) => k !== "deutschland" && k !== "europa",
  );
  const half = Math.ceil(landtagSlugs.length / 2);
  const firstHalf = landtagSlugs.slice(0, half);
  const secondHalf = landtagSlugs.slice(half);

  return (
    <div>
      <title>Metawahl</title>
      <div className="ui container">
        <div className="ui two column stackable grid middle aligned" id="hero">
          <div className="column">
            <h1 className="ui header" style={{ fontSize: "4rem" }}>
              <Logo className="logo" aria-label="Metawahl Logo" />
            </h1>
          </div>
          <div className="column">
            <h2 className="ui large header">
              Metawahl zeigt, wie sich der politische Konsens in Deutschland über
              Zeit ändert.
            </h2>
            <h3 className="ui medium header">
              Hierzu werden die Aussagen der Parteien aus 50 Wahl-o-Maten mit den
              dazugehörigen Wahlergebnissen zusammengeführt. Es wird sichtbar,
              welche Politik von vielen Stimmen gestützt wird und welche Parteien
              dies möglich machen.
            </h3>

            <div
              className="ui sub header"
              style={{
                fontSize: "0.9rem",
                fontStyle: "italic",
                marginTop: ".5rem",
                textTransform: "none",
              }}
            >
              Von{" "}
              <a
                href="https://blog.vincentahrend.com/"
                style={{
                  color: "rgba(0,0,0,.6)",
                  borderBottom: "1px solid rgba(0,0,0,.4)",
                }}
              >
                Vincent Ahrend
              </a>
            </div>

            <a
              className="ui basic left labeled icon button"
              href="/wahlen/thueringen/49"
              style={{ marginBottom: 5, marginTop: "1.5em" }}
            >
              <i className="arrow right icon" />
              Thüringen 2019
            </a>
            <a
              className="ui basic left labeled icon button"
              href="/quiz/thueringen/49"
              style={{ marginBottom: 5 }}
            >
              <i className="arrow right icon" />
              Quiz zu Thüringen
            </a>
            <a className="ui basic left labeled icon button" href="/wahlen/">
              <i className="arrow right icon" />
              Alle Länder
            </a>
          </div>
        </div>
      </div>

      <div className="ui container">
        <div className="ui stackable three column grid">
          <div className="row">
            <div className="column">
              <h1>Wie Metawahl funktioniert</h1>
            </div>
          </div>

          <div className="column">
            <h2 className="ui medium header">
              Parteien fordern unterschiedliche Politik
            </h2>
            <p>
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

          <div className="column">
            <h2 className="ui medium header">
              Aber welche Politik hat die Wahl gewonnen?
            </h2>
            <p>
              Nach der Wahl wissen wir, welche Parteien die meisten Stimmen
              bekommen haben. Wenn Parteien und Positionen sich einfach in links
              und rechts teilen ließen, wäre damit auch klar, welche Positionen
              gewonnen haben.
            </p>
            <p>
              Aber was ist, wenn Parteien sich in vielen verschiedenen
              Richtungen gegenüberstehen? Wenn eine klassisch konservative
              Partei auch linke Postionen vertritt, oder eine klassisch linke
              Partei auch für konservative Interessen einsteht? Welche Politik
              hat jetzt die Mehrheit der Wählerstimmen bekommen? Genau das zeigt
              Metawahl für viele Wahlen in Deutschland, durch eine Verbindung
              der Fragen und Antworten aus dem Wahl-o-Mat mit den jeweiligen
              Wahlergebnissen.
            </p>
          </div>

          <div className="column">
            <h2 className="ui medium header">Oft unter einem Kompromiss</h2>
            <p>
              Die Position mit einer Mehrheit ist dabei nicht immer die, die von
              den meisten Wählern gewünscht wird. In einem repräsentativen
              Wahlsystem werden auch ungewünschte Positionen mit eingekauft,
              weil es nur eine begrenzte Anzahl an Parteien auf dem Wahlzettel
              gibt.
            </p>
            <p>
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

        <h2 className="ui large header" style={{ margin: "4rem auto 1em" }}>
          <Link
            to="/wahlen"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.4)" }}
          >
            Alle Wahlen
          </Link>
        </h2>

        <div className="ui stackable four column grid">
          <div className="column">
            <Link to="/wahlen/deutschland/">
              <h3>Deutschland</h3>
              <Map territory="deutschland" style={{ maxHeight: "12em" }} />
            </Link>
          </div>
          <div className="column">
            <Link to="/wahlen/europa/">
              <h3>Europa</h3>
              <Map territory="europa" style={{ maxHeight: "12em" }} />
            </Link>
          </div>
          <div className="column">
            <h3>Landtagswahlen</h3>
            <div className="ui list">
              {firstHalf.map((k) => (
                <div className="item" key={k}>
                  <Link to={`/wahlen/${k}/`}>{TERRITORY_NAMES[k]}</Link>
                </div>
              ))}
            </div>
          </div>
          <div className="column">
            <h3>&nbsp;</h3>
            <div className="ui list">
              {secondHalf.map((k) => (
                <div className="item" key={k}>
                  <Link to={`/wahlen/${k}/`}>{TERRITORY_NAMES[k]}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SuggestionsGrid
          title="Und jetzt"
          sections={[
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
          ]}
        />
      </div>
    </div>
  );
}
