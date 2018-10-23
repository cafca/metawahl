import React from "react"

import "./Map.css"

import { TERRITORY_NAMES } from "../../config/"

// TODO: Wait for this PR to be released, then remove the custom loader
// (also in footer)
// https://github.com/facebook/create-react-app/pull/3718

import { ReactComponent as Deutschland } from "./Deutschland.svg"
import { ReactComponent as Europa } from "./Europa.svg"

type MapProps = {
  territory: string,
  style?: {}
}

const noteEurope = `SVG Europakarte lizensiert unter Public Domain, via
  Wikimedia Commons (Link siehe Impressum)`
const noteGerman = `SVG Deutschlandkarte lizensiert unter Creative Commons
  Attribution-Share Alike 2.0 Germany und basierend auf Roman Poulvas,
  David Liuzzo (Karte Bundesrepublik Deutschland.svg), via Wikimedia
  Commons (Siehe Link im Impressum).`

const altText = (props: MapProps) =>
  props.territory === "europa"
    ? "Europakarte"
    : props.territory === "deutschland"
      ? "Karte Bundesrepublik Deutschland"
      : "Karte Bundesrepublik Deutschland mit Hervorherbung von " +
        TERRITORY_NAMES[props.territory]

const Map = (props: MapProps) =>
  props.territory === "europa" ? (
    <Europa
      alt={altText(props)}
      title={noteEurope}
      style={props.style}
      className="map"
    />
  ) : (
    <Deutschland
      className={
        (props.inverted ? "inverted " : " ") +
        "map territory-" +
        props.territory
      }
      title={noteGerman}
      alt={altText(props)}
      style={props.style}
    />
  )

export default Map
