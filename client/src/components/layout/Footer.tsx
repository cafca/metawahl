import { Link } from "react-router-dom";
import { TERRITORY_NAMES, type TerritorySlug } from "@/config";
import useBase from "@/hooks/useBase";
import logoBmbf from "@/assets/logo-bmbf.svg";
import logoOkfn from "@/assets/logo-okfn.svg";

export function Footer() {
  const { data } = useBase();
  const electionsByTerritory = data?.data.elections;

  const territories = electionsByTerritory
    ? (Object.keys(electionsByTerritory) as TerritorySlug[])
    : [];

  const recentElections = electionsByTerritory
    ? Object.values(electionsByTerritory)
        .flat()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, territories.length)
    : [];

  return (
    <footer className="mt-20 bg-segment-inverted py-20 text-segment-inverted-fg">
      <div className="mx-auto max-w-[1127px] px-4 text-center">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:divide-x md:divide-white/15">
          <section className="px-6 text-left">
            <h4 className="mb-4 text-[15px] font-bold uppercase tracking-wide">
              Letzte Wahlen
            </h4>
            <ul className="space-y-1.5">
              {recentElections.map((e) => (
                <li key={`footer-election-${e.id}`}>
                  <a
                    href={`/wahlen/${e.territory}/${e.id}/`}
                    className="text-white/90 hover:text-white hover:underline"
                  >
                    {e.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="px-6 text-left">
            <h4 className="mb-4 text-[15px] font-bold uppercase tracking-wide">
              Über Metawahl
            </h4>
            <p className="mb-3 leading-relaxed">Metawahl — Was haben wir gewählt?</p>
            <p className="mb-3 leading-relaxed">
              Ein Projekt von{" "}
              <a
                href="http://vincentahrend.com/"
                className="font-bold text-white hover:underline"
              >
                Vincent Ahrend
              </a>
            </p>
            <p className="mb-3 leading-relaxed">
              Mit Unterstützung von{" "}
              <a
                href="https://denk-nach-mcfly.de"
                className="font-bold text-white hover:underline"
              >
                Hanno »friesenkiwi«
              </a>{" "}
              und{" "}
              <a
                href="https://github.com/gockelhahn/qual-o-mat-data"
                className="font-bold text-white hover:underline"
              >
                Felix Bolte »gockelhahn«
              </a>{" "}
              bei der Konzeptfindung und beim Crawlen, Parsen und Taggen der Daten.
            </p>
            <p className="mb-3 leading-relaxed">
              Mit dem Metawahl-Logo und gestalterischer Unterstützung von{" "}
              <a
                href="http://linastindt.de"
                className="font-bold text-white hover:underline"
              >
                Lina Stindt
              </a>
              .
            </p>
            <p className="mb-3 leading-relaxed">
              Alle Fragen und Antworten aus dem Wahl-o-Mat der Bundeszentrale für
              politische Bildung. Auch wenn diese Daten hier ohne jegliche
              inhaltliche Modifikationen abgebildet werden sollen, kann es aus
              technischen Gründen zu Übertragunsfehlern gekommen sein. Solche
              bitten wir{" "}
              <a
                href="mailto:metawahl@vincentahrend.com"
                className="font-bold text-white hover:underline"
              >
                per Email
              </a>{" "}
              zu melden.
            </p>
            <p className="my-8 leading-relaxed">
              Vollständiger Quellcode verfügbar auf{" "}
              <a
                href="https://github.com/ciex/metawahl"
                className="font-bold text-white hover:underline"
              >
                Github
              </a>
            </p>
            <p className="mb-6 leading-relaxed">
              Ein{" "}
              <a
                href="https://prototypefund.de/"
                className="font-bold text-white hover:underline"
              >
                Prototype Fund
              </a>{" "}
              Projekt
            </p>
            <p className="flex flex-wrap items-center gap-4">
              <a href="https://bmbf.de/" aria-label="Bundesministerium für Bildung und Forschung">
                <img
                  src={logoBmbf}
                  alt="gefördert von: Logo Bundesministerium für Bildung und Forschung"
                  style={{ filter: "invert(100%) grayscale(100%)" }}
                  className="h-16"
                />
              </a>
              <a href="https://okfn.de/" aria-label="Open Knowledge Foundation">
                <img
                  src={logoOkfn}
                  alt="Logo Open Knowledge Foundation"
                  style={{ filter: "invert(100%)" }}
                  className="h-10"
                />
              </a>
            </p>
          </section>

          <section className="px-6 text-left">
            <h4 className="mb-4 text-[15px] font-bold uppercase tracking-wide">
              Gebiete
            </h4>
            <ul className="space-y-1.5">
              {territories.map((t) => (
                <li key={`footer-territory-${t}`}>
                  <a
                    href={`/wahlen/${t}/`}
                    className="text-white/90 hover:text-white hover:underline"
                  >
                    {TERRITORY_NAMES[t]}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <hr className="my-10 border-t border-white/15" />

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <li>
            <a
              href="mailto:metawahl@vincentahrend.com"
              className="font-bold text-white hover:underline"
            >
              metawahl@vincentahrend.com
            </a>
          </li>
          <li>
            <Link to="/legal/" className="font-bold text-white hover:underline">
              Impressum
            </Link>
          </li>
          <li>
            <Link to="/legal/#privacy" className="font-bold text-white hover:underline">
              Datenschutzerklärung
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
