import React from 'react';

import './Map.css';

import { TERRITORY_NAMES } from "../Config";

// TODO: Wait for this PR to be released, then remove the custom loader
// https://github.com/facebook/create-react-app/pull/3718

import Deutschland from '-!svg-react-loader!./Deutschland.svg'; // eslint-disable-line import/no-webpack-loader-syntax
import Europa from '-!svg-react-loader!./Europa.svg'; // eslint-disable-line import/no-webpack-loader-syntax

type MapProps = {
  territory: string
};

const noteEurope = `SVG Europakarte lizensiert unter Public Domain, via
  Wikimedia Commons (Link siehe Impressum)`;
const noteGerman = `SVG Deutschlandkarte lizensiert unter Creative Commons
  Attribution-Share Alike 2.0 Germany und basierend auf Roman Poulvas,
  David Liuzzo (Karte Bundesrepublik Deutschland.svg), via Wikimedia
  Commons (Siehe Link im Impressum).`;

const altText = (props: MapProps) => props.territory === 'europa'
  ? 'Europakarte'
  : props.territory === 'deutschland'
    ? 'Karte Bundesrepublik Deutschland'
    : 'Karte Bundesrepublik Deutschland mit Hervorherbung von '
      + TERRITORY_NAMES[props.territory]


const SVGMap = (props: MapProps) => props.territory === 'europa'
  ? <Europa
  alt={altText(props)}
  title={noteEurope}
  {...props} />
  : <Deutschland
  className={(props.inverted ? 'inverted ' : ' ') + 'territory-' + props.territory}
  title={noteGerman}
  alt={altText(props)}
  {...props} />;

export default SVGMap;
