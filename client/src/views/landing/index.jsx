// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Header, Grid, List, Segment } from 'semantic-ui-react';


import { RouteProps } from '../../types/';
import { TERRITORY_NAMES } from '../../config/';
import Map from '../../components/map/';

class LandingView extends React.Component<RouteProps> {
  render() {
    const territorries = Object.keys(TERRITORY_NAMES)
      .filter(k => ['deutschland', 'europa'].indexOf(k) === -1).map(k =>
      <List.Item key={k}>
        <Link to={'/wahlen/' + k + '/'}>{TERRITORY_NAMES[k]}</Link>
      </List.Item>);

    return <Container>
      <Container textAlign='center' style={{margin: "4em auto 7em"}}>
        <h1 className="ui header" style={{fontSize: "4rem"}}>
          Metawahl
          <div className="ui sub header" style={{textTransform: "none", color: "rgba(0,0,0,0.8)", fontSize: "1.5rem"}}>
            Was wir gewählt haben,<br /> als wir Parteien unsere Stimme
            gegeben haben
          </div>
          <div className="ui sub header" style={{fontSize: "0.9rem", fontStyle: "italic", marginTop: ".5rem", textTransform: "none"}}>
            Ein Projekt von <a href="https://vincentahrend.com/" style={{color: "rgba(0,0,0,.6)", borderBottom: "1px solid rgba(0,0,0,.4)"}}>Vincent Ahrend</a>
          </div>
        </h1>
      </Container>

      <Container text>
        <p>Metawahl verbindet Wahlergebnisse mit fast 1500 Positionsbekenntnissen, die im Rahmen des Wahl-o-Maten in
          den letzten 16 Jahren von den Parteien eingeholt wurden, um uns sagen zu können: Eine Mehrheit der Wähler hat
          ihre Stimme Parteien gegeben, die sich für die Umsetzung einer These ausgesprochen haben – oder eben nicht.
        </p>
      </Container>

      <Grid stackable columns='2' style={{margin: "3em 1em"}}>
        <Grid.Column stretched>
          <Segment as='h2' size='huge' inverted style={{backgroundColor: "rgb(169, 124, 144)", fontSize: "1.7rem", height: "100%"}}>
            <p style={{fontVariant: "all-small-caps", marginBottom: "0px", fontSize: "0.9em", lineGeight: "1em"}}><a href="/wahlen/deutschland/42" style={{color: "rgba(255, 255, 255, 0.9)"}}>Bundestagswahl 2013</a></p>
            Deutschland soll mehr Flüchtlinge aufnehmen
            <div style={{fontSize: "0.7em", fontWeight: "initial", lineHeight: "1.3em", marginTop: "0.3rem"}}>Keine Mehrheit dafür oder dagegen</div>
          </Segment>
        </Grid.Column>

        <Grid.Column stretched>
          <Segment as='h2' size='huge' inverted style={{backgroundColor: "rgb(234, 108, 110)", fontSize: "1.7rem", height: "100%"}}>
            <p style={{fontVariant: "all-small-caps", marginBottom: "0px", fontSize: "0.9em", lineGeight: "1em"}}><a href="/wahlen/deutschland/42" style={{color: "rgba(255, 255, 255, 0.9)"}}>Bundestagswahl 2017</a></p>
            Für die Aufnahme von neuen Asylsuchenden soll eine jährliche Obergrenze gelten.
            <div style={{fontSize: "0.7em", fontWeight: "initial", lineHeight: "1.3em", marginTop: "0.3rem"}}>53 von 100 Wählern gaben ihre Stimme Parteien, die <span style={{borderBottom: "1px solid white"}}>dagegen</span> sind.</div>
          </Segment>
        </Grid.Column>
      </Grid>

      <Grid stackable columns='3'>
        <Grid.Row>
          <Grid.Column>
          <h1>Wie Metawahl funktioniert</h1>
          </Grid.Column>
        </Grid.Row>

        <Grid.Column>
          <Header size='medium' >Parteien wollen unterschiedliche Politik machen</Header>

          <p>
            Bei Wahlen geben wir Parteien unsere Stimme, damit diese in unserem
            Namen Entscheidungen treffen. Jede Partei vertritt dabei
            unterschiedliche Positionen zu ausstehenden Entscheidungen.
          </p>

          <p>
            Aber in welchen Punkten unterscheiden sich die Parteien eigentlich genau voneinander?
            Der Wahl-o-Mat der Bundeszentrale für politische Bildung ist enorm
            erfolgreich darin, uns zu zeigen, welche Fragen wir ihnen stellen
            können um sie klar voneinander zu trennen.
          </p>
        </Grid.Column>

        <Grid.Column>
          <Header size='medium' >Aber welche Politik hat die Wahl gewonnen?</Header>

          <p>
            Nach der Wahl wissen wir dann, welche Parteien die meisten Stimmen
            bekommen haben. Wenn Parteien und Positionen sich einfach in links
            und rechts teilen lassen würden, wäre damit auch schnell klar,
            welche Positionen gewonnen haben.
          </p>

          <p>
            Aber was ist, wenn Parteien sich in vielen verschiedenen Richtungen
            gegenüberstehen? Wenn eine klassisch konservative Partei auch linke Postionen
            vertritt, oder eine klassisch linke Partei auch für konservative
            Interessen einsteht? Welche Politik hat jetzt die Mehrheit
            der Wählerstimmen bekommen?
          </p>

          <p>
            <em>Metawahl</em> verbindet Wahlergebnisse mit fast 1500 Positionsbekenntnissen,
            die im Rahmen des Wahl-o-Maten in den letzten 16 Jahren von den Parteien
            eingeholt wurden, um uns sagen zu können: Eine Mehrheit der Wähler
            hat ihre Stimme Parteien gegeben, die sich
            für die Umsetzung einer These ausgesprochen haben – oder eben nicht.
          </p>
        </Grid.Column>
        <Grid.Column>
          <Header size='medium'>Repräsentative Wahl fordert Kompromisse</Header>

          <p>
            Die Position mit einer Mehrheit ist dabei nicht immer die, die von den meisten
            Wählern gewünscht wird. Bei Abstimmungen unserem repräsentativen Wahlsystem werden
            auch ungewünschte Positionen mit eingekauft, weil es nur eine begrenzte
            Anzahl an Parteien auf dem Wahlzettel gibt.
          </p>

          <p><strong>
            Auf Metawahl findest du heraus, welche Positionen unter diesem Kompromiss
            eine Mehrheit der Wählerstimmen bekommen haben.
          </strong></p>

          <p>
            In den Thesen spiegelt sich auch, wie sich die Position der Wähler oder
            einer Partei über die Zeit entwickelt hat und wie sie unterschiedlich
            sie bei Wahlen in Europa, den Bundestags- und verschiedenen Landtagswahlen
            sein kann.
          </p>
        </Grid.Column>
      </Grid>

      <Grid stackable columns='2' style={{margin: "3em 1em"}}>
        <Grid.Column streteched>
          <Segment as='h2' size='huge' inverted style={{backgroundColor: "rgb(61, 133, 179)", fontSize: "1.7rem", height: "100%"}}>
            <p style={{fontVariant: "all-small-caps", marginBottom: "0px", fontSize: "0.9em", lineGeight: "1em"}}><a href="/wahlen/deutschland/42" style={{color: "rgba(255, 255, 255, 0.8)"}}>Bundestagswahl 2017</a></p>
            Die Videoüberwachung im öffentlichen Raum soll ausgeweitet werden.
            <div style={{fontSize: "0.7em", fontWeight: "initial", lineHeight: "1.3em", marginTop: "0.3rem"}}>68 von 100 Wählern haben ihre Stimme befürwortenden Parteien gegeben</div>
          </Segment>
        </Grid.Column>

        <Grid.Column streteched>
          <Segment as='h2' size='huge' inverted style={{backgroundColor: "rgb(169, 124, 144)", fontSize: "1.7rem", height: "100%"}}>
            <p style={{fontVariant: "all-small-caps", marginBottom: "0px", fontSize: "0.9em", lineGeight: "1em"}}><a href="/wahlen/deutschland/42" style={{color: "rgba(255, 255, 255, 0.8)"}}>Landtagswahl Nordrhein-Westfalen 2017</a></p>
            Die Videoüberwachung auf Straßen und Plätzen soll ausgeweitet werden.
            <div style={{fontSize: "0.7em", fontWeight: "initial", lineHeight: "1.3em", marginTop: "0.3rem"}}>Keine Mehrheit dafür oder dagegen</div>
          </Segment>
        </Grid.Column>
      </Grid>

      <Container text>
        <Header size='medium' style={{marginTop: "2em"}}>
          Lies jetzt:
        </Header>

        <p>
          <Link to="/themen/kernenergie/" style={{borderBottom: "1px solid rgba(0,0,0,0.4)"}}>
            19 Thesen zu <strong>#Kernenergie</strong>
          </Link>
        </p>

        <p>
          <Link to="/themen/abitur-nach-der-12-jahrgangsstufe/" style={{borderBottom: "1px solid rgba(0,0,0,0.4)"}}>
            10 Thesen zu <strong>#Abitur nach der 12. Jahrgangsstufe</strong>
          </Link>
        </p>

        <p>
          <Link to='/themen/beitrittsverhandlungen-der-turkei-mit-der-europaischen-union/' style={{borderBottom: "1px solid rgba(0,0,0,0.4)"}}>
            5 Thesen zu <strong>#Beitrittsverhandlungen der Türkei mit der Europäischen Union</strong>
          </Link>
        </p>

        <p>
          Oder <Link style={{borderBottom: "1px solid rgba(0,0,0,0.4)"}} to='/themen/'>stöbere durch fast 600 weitere Themen</Link>.
        </p>
      </Container>

      <Header size='large' style={{margin: "4rem auto 1em"}}>
        <Link to='/wahlen' style={{borderBottom: "1px solid rgba(0,0,0,0.4)"}}>
          Alle Wahlen
        </Link>
      </Header>

      <Grid stackable columns='4'>
        <Grid.Column>
          <h3><Link to={'/wahlen/deutschland/'}>Deutschland</Link></h3>
          <Map territory='deutschland' style={{maxHeight: "12em"}}/>
        </Grid.Column>

        <Grid.Column>
          <h3><Link to={'/wahlen/europa/'}>Europa</Link></h3>
          <Map territory='europa' style={{maxHeight: "12em"}}/>
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
