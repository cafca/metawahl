// @flow

import React from 'react';
import {Link} from 'react-router-dom';
import {
  Container,
  Divider,
  Grid,
  Header,
  List,
  Segment
} from 'semantic-ui-react'

import type { RouteProps } from '../../types/';
import { TERRITORY_NAMES } from '../../config/';

const Footer = (props: RouteProps) => {
  const territorries = Object.keys(props.occasions).map(o =>
    <List.Item as='a' key={'footer-link-' + o} href={`/wahlen/${o}/`}>{TERRITORY_NAMES[o]}</List.Item>
  );

  const recentElections = Object.keys(props.occasions)
    .map(o => props.occasions[o])
    .reduce((prev, cur) => prev.concat(cur), [])
    .sort((a, b) => {return a.date < b.date ? 1 : -1})
    .slice(0, territorries.length)
    .map(o => <List.Item key={'footer-link-' + o.id} as='a'
      href={'/wahlen/' + o.territory + '/' + o.id}>
      {o.title}
    </List.Item>);


  return <Segment inverted vertical
    style={{ margin: '5em 0em 0em', padding: '5em 0em' }} >
    <Container textAlign='center'>
      <Grid divided inverted stackable columns={3}>
        <Grid.Row>
          <Grid.Column textAlign='left'>
            <Header inverted as='h4' content='Parlamente' />
            <List link inverted>
              {territorries}
            </List>
          </Grid.Column>
          <Grid.Column textAlign='left'>
            <Header inverted as='h4' content='Letzte Wahlen' />
            <List link inverted>
              {recentElections}
            </List>
          </Grid.Column>
          <Grid.Column textAlign='left' className='ui inverted link list'>
            <Header inverted as='h4' content='Über Metawahl' />
            <p>Welche Politik haben wir gewählt, als wir Parteien unsere Stimme gegeben haben?</p>
            <p>Ein Projekt von <a className="item" href="http://vincentahrend.com/">Vincent Ahrend</a></p>
            <p>
              Mit freundlicher Unterstützung von <a className='item' href="https://denk-nach-mcfly.de">Hanno »friesenkiwi«</a> und <a className='item' href="https://github.com/gockelhahn/qual-o-mat-data">Felix Bolte »gockelhahn«</a> bei der Konzeptfindung und beim Crawlen, Parsen und Taggen der Daten.
            </p>
            <p>Gefördert von: <br />
              <Link className='item' to="https://www.bmbf.de/">Bundesministerium für Bildung und Forschung</Link> <br />
              <Link className='item' to="https://prototypefund.de/">Prototype Fund</Link>
            </p>
            <p>Vollständiger Quellcode verfügbar auf <a className='item' href="https://github.com/ciex/metawahl">Github</a></p>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Divider inverted section />
      <List horizontal inverted divided link>
        <List.Item as='a' href='#'>Site Map</List.Item>
        <List.Item as='a' href='mailto:metawahl@vincentahrend.com'>metawahl@vincentahrend.com</List.Item>
        <List.Item as='a' href='/legal'>Impressum</List.Item>
        <List.Item as='a' href='/legal#privacy'>Datenschutzerklärung</List.Item>
      </List>
    </Container>
  </Segment>
};

export default Footer;
