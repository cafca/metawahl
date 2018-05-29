// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Grid, Header, List, Segment
} from 'semantic-ui-react';

import { RouteProps } from '../../types/';
import { TERRITORY_NAMES } from '../../config/';
import Map from '../../components/map/';

import Logo from '-!svg-react-loader!../../logo.svg'; // eslint-disable-line import/no-webpack-loader-syntax

import './Landing.css';

class LandingView extends React.Component<RouteProps> {
  render() {
    const territorries = Object.keys(TERRITORY_NAMES)
      .filter(k => ['deutschland', 'europa'].indexOf(k) === -1).map(k =>
      <List.Item key={k}>
        <Link to={'/wahlen/' + k + '/'}>{TERRITORY_NAMES[k]}</Link>
      </List.Item>);

    return <Container>
      <Container textAlign='center' style={{margin: "4em auto 5em"}}>
        <h1 className="ui header" style={{fontSize: "4rem"}}>
          <Logo className='logo' style={{marginBottom: "-1em"}}/>
          <div>Metawahl</div>
          <div className="ui sub header" style={{textTransform: "none", color: "rgba(0,0,0,0.8)", fontSize: "1.5rem"}}>
            Was Deutschland gewählt hat
          </div>
          <div className="ui sub header" style={{fontSize: "0.9rem", fontStyle: "italic", marginTop: ".5rem", textTransform: "none"}}>
            Von <a href="http://vincentahrend.com/" style={{color: "rgba(0,0,0,.6)", borderBottom: "1px solid rgba(0,0,0,.4)"}}>Vincent Ahrend</a>
          </div>
        </h1>
      </Container>

      <Container text>
        <p>
        Metawahl nutzt Stellungnahmen aus 43 Wahl-o-Maten um zu zeigen, welche Positionen von einer Mehrheit gewählt wurden — und wie sich
        diese im Laufe der Zeit geändert haben.
        </p>
        <p>
          Es werden Entwicklungen deutlich, wie die bei der Frage nach der Aufnahme von Asylsuchenden zwischen
          den Bundestagswahlen 2013 und 2017. Vor der Flüchtlingskrise war das Ergebnis neutral, jetzt gibt es eine knappe
          Mehrheit <em>gegen</em> eine Obergrenze:
        </p>
      </Container>

      <Grid stackable columns='2' style={{margin: "5em 1em"}}>
        <Grid.Column>
          <Segment as='h2' size='huge' inverted style={{backgroundColor: "rgb(160, 160, 160)", fontSize: "1.7rem"}}>
            <p style={{fontVariant: "all-small-caps", marginBottom: "0px", fontSize: "0.9em", lineGeight: "1em"}}><a className='item' href="/wahlen/deutschland/29" style={{color: "rgba(255, 255, 255, 0.9)"}}>Bundestagswahl 2013</a></p>
            Deutschland soll mehr Flüchtlinge aufnehmen
            <div style={{fontSize: "0.7em", fontWeight: "initial", lineHeight: "1.3em", marginTop: "0.3rem"}}>Keine Mehrheit dafür oder dagegen</div>
          </Segment>
        </Grid.Column>

        <Grid.Column>
          <Segment as='h2' size='huge' inverted style={{backgroundColor: "rgb(213, 0, 28)", fontSize: "1.7rem"}}>
            <p style={{fontVariant: "all-small-caps", marginBottom: "0px", fontSize: "0.9em", lineGeight: "1em"}}><a className='item' href="/wahlen/deutschland/42" style={{color: "rgba(255, 255, 255, 0.9)"}}>Bundestagswahl 2017</a></p>
            Für die Aufnahme von neuen Asylsuchenden soll eine jährliche Obergrenze gelten.
            <div style={{fontSize: "0.7em", fontWeight: "initial", lineHeight: "1.3em", marginTop: "0.3rem"}}>53 von 100 haben Parteien gewählt, die gegen eine Obergrenze sind.</div>
          </Segment>
        </Grid.Column>
      </Grid>

      <Grid stackable celled relaxed doubling columns='4' className='suggestions hyphenate'>
        <Grid.Row>
          <Grid.Column>
            <h2>
              <em>Lies jetzt</em>
            </h2>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column>
            <Link to="/wahlen/deutschland/42/">
                <Header as='h2'>
                  <Header.Subheader>
                    Alle Fragen aus der
                  </Header.Subheader>
                  Bundestagswahl 2017
                </Header>
            </Link>
          </Grid.Column>
          <Grid.Column>
            <Link to="/quiz/deutschland/42/">
                <Header as='h2'>
                  <Header.Subheader>
                    Teste dein Wissen
                  </Header.Subheader>
                  Quiz zur Bundestagswahl 2017
                </Header>
            </Link>
          </Grid.Column>
          <Grid.Column>
            <Link to="/themen/soziale-sicherheit/">
              <Header as='h2'>
                <Header.Subheader>
                  43 Thesen zu
                </Header.Subheader>
                #soziale Sicherheit
              </Header>
            </Link>
          </Grid.Column>
          <Grid.Column>
            <Link to="/themen/">
              <Header as='h2'>
                <Header.Subheader>
                oder stöbere in weiteren
                </Header.Subheader>
                600+ Themen
              </Header>
            </Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Grid stackable columns='3'>
        <Grid.Row>
          <Grid.Column>
          <h1>Wie Metawahl funktioniert</h1>
          </Grid.Column>
        </Grid.Row>

        <Grid.Column>
          <Header size='medium' >Parteien fordern unterschiedliche Politik</Header>

          <p>
            Bei Wahlen geben wir Parteien unsere Stimme, damit diese in unserem
            Namen Entscheidungen treffen. Jede Partei vertritt dabei
            unterschiedliche Positionen zu ausstehenden Entscheidungen.
          </p>

          <p>
            Vieles sehen die Parteien auch sehr ähnlich – aber in welchen Punkten unterscheiden sie sich eigentlich voneinander?
            Der Wahl-o-Mat der Bundeszentrale für politische Bildung ist enorm
            erfolgreich darin, uns zu zeigen, welche Fragen wir ihnen stellen
            können um sie klar voneinander zu trennen.
          </p>
        </Grid.Column>

        <Grid.Column>
          <Header size='medium' >Aber welche Politik hat die Wahl gewonnen?</Header>

          <p>
            Nach der Wahl wissen wir, welche Parteien die meisten Stimmen
            bekommen haben. Wenn Parteien und Positionen sich einfach in links
            und rechts teilen ließen, wäre damit auch klar,
            welche Positionen gewonnen haben.
          </p>

          <p>
            Aber was ist, wenn Parteien sich in vielen verschiedenen Richtungen
            gegenüberstehen? Wenn eine klassisch konservative Partei auch linke Postionen
            vertritt, oder eine klassisch linke Partei auch für konservative
            Interessen einsteht? Welche Politik hat jetzt die Mehrheit
            der Wählerstimmen bekommen? Genau das zeigt Metawahl für viele
            Wahlen in Deutschland, durch eine Verbindung der Fragen und Antworten
            aus dem Wahl-o-Mat mit den jeweiligen Wahlergebnissen.
          </p>
        </Grid.Column>
        <Grid.Column>
          <Header size='medium'>Oft unter einem Kompromiss</Header>
          <p>
            Die Position mit einer Mehrheit ist dabei nicht immer die, die von den meisten
            Wählern gewünscht wird. In einem repräsentativen Wahlsystem werden
            auch ungewünschte Positionen mit eingekauft, weil es nur eine begrenzte
            Anzahl an Parteien auf dem Wahlzettel gibt.
          </p>

          <p><strong>
            Auf Metawahl findest du heraus, welche Positionen unter diesem Kompromiss
            eine Mehrheit der Wählerstimmen bekommen haben.
          </strong></p>

          <p>
            In den Thesen spiegelt sich auch, wie sich die Position der Wähler – oder
            einer Partei – über die Zeit entwickelt hat, und wie unterschiedlich
            sie bei Wahlen in Europa, den Bundestags- und verschiedenen Landtagswahlen
            sein kann.
          </p>
        </Grid.Column>
      </Grid>

      <Header size='large' style={{margin: "4rem auto 1em"}}>
        <Link to='/wahlen' style={{borderBottom: "1px solid rgba(0,0,0,0.4)"}}>
          Alle Wahlen
        </Link>
      </Header>

      <Grid stackable columns='4'>
        <Grid.Column>
          <Link to={'/wahlen/deutschland/'}>
            <h3>Deutschland</h3>
            <Map territory='deutschland' style={{maxHeight: "12em"}}/>
          </Link>
        </Grid.Column>

        <Grid.Column>
          <Link to={'/wahlen/europa/'}>
            <h3>Europa</h3>
            <Map territory='europa' style={{maxHeight: "12em"}}/>
          </Link>
        </Grid.Column>

        <Grid.Column>
          <h3>Landtagswahlen</h3>
          <List>
            {territorries.slice(0, parseInt(territorries.length / 2, 10))}
          </List>
        </Grid.Column>

        <Grid.Column>
          <h3>&nbsp;</h3>
          <List>
            {territorries.slice(parseInt(territorries.length / 2, 10))}
          </List>
        </Grid.Column>
      </Grid>
  </Container>
  }
}

export default LandingView;
