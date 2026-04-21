// @flow

import React from "react"
import { Link } from "react-router-dom"
import { Grid, Header } from "semantic-ui-react"

import "./styles.css"

type SectionType = {
  subTitle: string,
  title: string,
  href: string
}

type Props = {
  title: string,
  sections: [SectionType]
}

const SuggestionsGrid = ({ title, sections }: Props) => {
  const cols = sections.map((sect, i) => (
    <Grid.Column key={"suggestion-grid-" + i}>
      <Link to={sect.href}>
        <Header as="h2">
          <Header.Subheader>{sect.subTitle}</Header.Subheader>
          {sect.title}
        </Header>
      </Link>
    </Grid.Column>
  ))

  return (
    <Grid
      stackable
      celled
      relaxed
      doubling
      columns={cols.length}
      className="suggestions hyphenate"
    >
      <Grid.Row>
        <Grid.Column>
          <h2>
            <em>{title}</em>
          </h2>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>{cols}</Grid.Row>
    </Grid>
  )
}

export default SuggestionsGrid
