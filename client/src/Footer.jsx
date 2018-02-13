// @flow

import React from 'react';
import {
  Container,
  Divider,
  Grid,
  Header,
  List,
  Segment
} from 'semantic-ui-react'

const Footer = () => (<Segment
      inverted
      vertical
      style={{ margin: '5em 0em 0em', padding: '5em 0em' }}
    >
      <Container textAlign='center'>
        <Grid divided inverted stackable columns={3}>
          <Grid.Row>
            <Grid.Column textAlign='left'>
              <Header inverted as='h4' content='Bundesländer' />
              <List link inverted>
                <List.Item as='a'>Berlin</List.Item>
                <List.Item as='a'>Brandenburg</List.Item>
                <List.Item as='a'>Sachsen</List.Item>
                <List.Item as='a'>Sachsen-Anhalt</List.Item>
              </List>
            </Grid.Column>
            <Grid.Column textAlign='left'>
              <Header inverted as='h4' content='Letzte Wahlen' />
              <List link inverted>
                <List.Item as='a'>Landtagswahl Schleswig-Holstein 2017</List.Item>
                <List.Item as='a'>Landtagswahl Schleswig-Holstein 2017</List.Item>
                <List.Item as='a'>Landtagswahl Schleswig-Holstein 2017</List.Item>
                <List.Item as='a'>Landtagswahl Schleswig-Holstein 2017</List.Item>
              </List>
            </Grid.Column>
            <Grid.Column textAlign='left'>
              <Header inverted as='h4' content='Über Metawahl' />
              <p>Metawahl – Was haben wir da eigentlich gewählt?</p>
              <p>Gefördert vom Bundesministerium für Bildung und Forschung</p>
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
);

export default Footer;
