// @flow

import React from  'react'
import { Link } from 'react-router-dom';
import {
  Container, Grid, Header, List, Segment
} from 'semantic-ui-react';

import './styles.css'

type Props = {
  title: string,
  sections: [SectionType]
}

type SectionType = {
  subTitle: string,
  title: string,
  href: string
}

const SuggestionsGrid = ({title, sections}: Props) => {
  const cols = sections.map(sect =>
    <Grid.Column>
      <Link to={sect.href}>
          <Header as='h2'>
            <Header.Subheader>
              {sect.subTitle}
            </Header.Subheader>
            {sect.title}
          </Header>
      </Link>
    </Grid.Column>
  )

  return <Grid stackable celled relaxed doubling columns={cols.length} className='suggestions hyphenate'>
    <Grid.Row>
      <Grid.Column>
        <h2>
          <em>{title}</em>
        </h2>
      </Grid.Column>
    </Grid.Row>
    <Grid.Row>
      {cols}
    </Grid.Row>
  </Grid>
}


export default SuggestionsGrid
