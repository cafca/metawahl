// @flow

import React from 'react';
import {
  Header,
  Icon,
  Label
} from 'semantic-ui-react';

type WikidataProps = {
  wikidata_id: string,
  url: string
};

export const WikidataLabel = ({ wikidata_id, url } : WikidataProps) => {
  return <Header floated='right' style={{marginRight: "-10.5px"}}>
      <Label as='a' basic image href={url} >
        <img src="/img/Wikidata-logo.svg" alt="Wikidata logo" /> {wikidata_id}
      </Label>
    </Header>
}

type WikipediaProps = {
  wikipedia_title: string,
  style?: Object
};

export const WikipediaLabel = ({ wikipedia_title, style } : WikipediaProps) => {
  return <Header floated='right' style={style}>
      <Label as='a' basic image
        href={"https://de.wikipedia.org/wiki/" + wikipedia_title} >
        <Icon name="wikipedia" /> {wikipedia_title}
      </Label>
    </Header>
}
