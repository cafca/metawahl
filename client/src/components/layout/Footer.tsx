import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import BMBF from "@/assets/logo-bmbf.svg?react";
import OKFN from "@/assets/logo-okfn.svg?react";

export function Footer() {
  const { data } = useBase();
  const electionsByTerritory = data?.data.elections;

  const territorySlugs: TerritorySlug[] = electionsByTerritory
    ? (Object.keys(electionsByTerritory) as TerritorySlug[])
    : [];

  const territorries = territorySlugs.map((o) => (
    <a className="item" key={`footer-link-${o}`} href={`/wahlen/${o}/`}>
      {TERRITORY_NAMES[o]}
    </a>
  ));

  const recentElections = electionsByTerritory
    ? Object.values(electionsByTerritory)
        .flat()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, territorySlugs.length)
        .map((o) => (
          <a
            className="item"
            key={`footer-link-${o.id}`}
            href={`/wahlen/${o.territory}/${o.id}/`}
          >
            {o.title}
          </a>
        ))
    : [];

  return (
    <div
      className="ui inverted vertical segment"
      style={{ margin: "5em 0em 0em", padding: "5em 0em" }}
    >
      <div className="ui container center aligned">
        <div className="ui stackable inverted divided three column grid">
          <div className="row">
            <div className="left aligned column">
              <h4 className="ui inverted header">Letzte Wahlen</h4>
              <div className="ui link inverted list">{recentElections}</div>
            </div>
            <div className="left aligned column ui inverted link list">
              <h4 className="ui inverted header">Über Metawahl</h4>
              <p>Metawahl — Was haben wir gewählt?</p>
              <p>
                Ein Projekt von{" "}
                <a className="item" href="http://vincentahrend.com/">
                  Vincent Ahrend
                </a>
              </p>
              <p>
                Mit Unterstützung von{" "}
                <a className="item" href="https://denk-nach-mcfly.de">
                  Hanno »friesenkiwi«
                </a>{" "}
                und{" "}
                <a
                  className="item"
                  href="https://github.com/gockelhahn/qual-o-mat-data"
                >
                  Felix Bolte »gockelhahn«
                </a>{" "}
                bei der Konzeptfindung und beim Crawlen, Parsen und Taggen der
                Daten.
              </p>
              <p>
                Mit dem Metawahl-Logo und gestalterischer Unterstützung von{" "}
                <a className="item" href="http://linastindt.de">
                  Lina Stindt
                </a>
                .
              </p>
              <p>
                Alle Fragen und Antworten aus dem Wahl-o-Mat der Bundeszentrale
                für politische Bildung. Auch wenn diese Daten hier ohne jegliche
                inhaltliche Modifikationen abgebildet werden sollen, kann es aus
                technischen Gründen zu Übertragunsfehlern gekommen sein. Solche
                bitten wir{" "}
                <a className="item" href="mailto:metawahl@vincentahrend.com">
                  per Email
                </a>{" "}
                zu melden.
              </p>

              <p style={{ margin: "2em auto" }}>
                Vollständiger Quellcode verfügbar auf{" "}
                <a className="item" href="https://github.com/ciex/metawahl">
                  Github
                </a>
              </p>

              <p>
                Ein{" "}
                <a className="item" href="https://prototypefund.de/">
                  Prototype Fund
                </a>{" "}
                Projekt
              </p>
              <p>
                <a href="https://bmbf.de/">
                  <BMBF
                    style={{ filter: "invert(100%) grayscale(100%)" }}
                    aria-label="gefördert von: Logo Bundesministerium für Bildung und Forschung"
                  />
                </a>
                <a href="https://okfn.de/">
                  <OKFN
                    style={{ filter: "invert(100%)" }}
                    aria-label="Logo Open Knowledge foundation"
                  />
                </a>
              </p>
            </div>
            <div className="left aligned column">
              <h4 className="ui inverted header">Gebiete</h4>
              <div className="ui link inverted list">{territorries}</div>
            </div>
          </div>
        </div>

        <div className="ui inverted section divider" />
        <div className="ui horizontal inverted divided link list">
          <a className="item" href="mailto:metawahl@vincentahrend.com">
            metawahl@vincentahrend.com
          </a>
          <a className="item" href="/legal">
            Impressum
          </a>
          <a className="item" href="/legal#privacy">
            Datenschutzerklärung
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;
