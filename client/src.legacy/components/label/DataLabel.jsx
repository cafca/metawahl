// @flow

import React from "react"
import { Header, Icon, Label, Responsive } from "semantic-ui-react"

type WikidataProps = {
  wikidata_id: string,
  url: string
}

export const WikidataLabel = ({ wikidata_id, url }: WikidataProps) => {
  return wikidata_id == null ? null : (
    <Header floated="right" style={{ marginRight: "-10.5px" }}>
      <Label as="a" basic image href={url} className="wikidataLabel">
        <img src="/img/Wikidata-logo.svg" alt="Wikidata logo" />
        <Responsive minWidth="768" as="span">
          Wikidata
        </Responsive>
      </Label>
    </Header>
  )
}

type WikipediaProps = {
  wikipedia_title: ?string,
  wikipedia_url: ?string,
  style?: Object
}

export const WikipediaLabel = ({
  wikipedia_title,
  wikipedia_url,
  style
}: WikipediaProps) => {
  if (wikipedia_title == null && wikipedia_url == null) return null

  const href =
    wikipedia_url == null
      ? "https://de.wikipedia.org/wiki/" + wikipedia_title
      : wikipedia_url

  const lastSepPos = wikipedia_url && wikipedia_url.lastIndexOf("/")
  const title =
    wikipedia_title == null
      ? wikipedia_url.slice(lastSepPos).replace("_", " ")
      : wikipedia_title

  return wikipedia_title == null ? null : (
    <Header floated="right" style={style}>
      <Label as="a" basic image href={href}>
        <Icon name="wikipedia w" />
        <Responsive minWidth="768" as="span">
          {" "}
          {decodeURIComponent(title)}
        </Responsive>
      </Label>
    </Header>
  )
}
