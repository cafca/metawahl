import type { ReactNode } from "react";

import Logo from "@/assets/logo.svg?react";
import type { ElectionSummary } from "@/types/api";

import "./SourcesFooter.css";

type Props = {
  election: ElectionSummary | undefined;
  iframe?: boolean;
  context?: string;
};

export function SourcesFooter({ election, iframe, context }: Props) {
  let resultsSource: ReactNode = "Wahlergebnissen oder Wahlprognosen";
  let womSource: ReactNode = "Wahl-o-Mat";
  let prelimNote = "";

  if (election != null && election.results_source != null) {
    const source_name = election.results_source.name;
    const source_url = election.results_source.url;

    if (source_name == null) {
      if (source_url.indexOf("wahl.tagesschau.de") >= 0) {
        resultsSource = (
          <a target="_blank" rel="noopener noreferrer" href={source_url}>
            Wahlergebnissen aus dem Tagesschau Wahlarchiv
          </a>
        );
      } else if (source_url.indexOf("wikipedia") >= 0) {
        resultsSource = (
          <a target="_blank" rel="noopener noreferrer" href={source_url}>
            Wahlergebnissen von Wikipedia
          </a>
        );
      } else if (source_url.indexOf("dawum.de") >= 0) {
        resultsSource = "Wahlprognosen von Dawum.de";
      }
    } else {
      if (election.preliminary !== true) {
        resultsSource = (
          <a href={source_url}>Wahlergebnissen ({source_name})</a>
        );
      } else {
        resultsSource = (
          <a href={source_url}>Wahlprognosen der {source_name}</a>
        );
      }
    }

    womSource =
      election.title === "Landtagswahl Hessen 2018" ? (
        <a
          href="https://www.wahl-o-mat.de/hessen2018/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wahl-o-Mat zur {election.title}
        </a>
      ) : (
        <a href={election.source} target="_blank" rel="noopener noreferrer">
          Wahl-o-Mat zur {election.title}
        </a>
      );
    prelimNote = election.preliminary ? "voraussichtlich " : "";
  }

  return (
    <div className="ui message source" id="methodik">
      {iframe === true && (
        <p>
          <Logo className="inlineLogo" />
          {context == null ? "Diese Analyse" : context} ist Teil von{" "}
          <a href="https://metawahl.de">Metawahl.de</a>, einem Tool das zeigt,
          wie sich die Parteipolitik in Deutschland über Zeit ändert. Es wurde
          von Vincent Ahrend entwickelt und vom Bundesministerium für Bildung
          und Forschung als Open Source-Projekt gefördert.
        </p>
      )}
      <p style={{ clear: "both" }}>
        Die Thesen und Parteipositionen stammen aus dem {womSource} der
        Bundeszentrale für politische Bildung. Sie wurden mit {resultsSource}{" "}
        kombiniert, um zu zeigen, welche politischen Positionen {prelimNote}
        von einer Mehrzahl der Wähler durch ihre Stimme unterstützt werden.
      </p>
    </div>
  );
}

export default SourcesFooter;
