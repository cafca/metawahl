// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import moment from 'moment';

import '../../index.css';
import { Link } from 'react-router-dom';
import { Container, Grid, Header, List } from 'semantic-ui-react';

import { TERRITORY_NAMES } from '../../config/';
import { OccasionListType, RouteProps } from '../../types/';
import MapComponent from '../../components/map/';
import SEO from '../../components/seo/';

import './OccasionList.css';

moment.locale('de');

type State = {
  occasions: OccasionListType
};

export default class OccasionList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      occasions: this.props.occasions
    };
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    this.setState({
      occasions: nextProps.occasions
    });
  }

  render() {
    let occasionCount = 0;

    const occasionElem = territory => {
      const occasions = this.state.occasions[territory] != null && this.state.occasions[territory]
        .sort((a, b) => a.date < b.date)
        .map(occasion => {
          occasionCount += 1;
          return <List.Item key={occasion.id} as='a'
            href={`/wahlen/${occasion.territory}/${occasion.id}/`}
            className='occasionListItem'>
          <List.Header as='h3'>{moment(occasion.date).year()}</List.Header>
          <span>
            {occasion.title.slice(0, occasion.title.indexOf(' '))} vom {moment(occasion.date).format('LL')}
          </span>
        </List.Item>});

      return <Grid.Column key={territory} className='territory'>
        <MapComponent territory={territory} className='map' />
        <Header dividing as='h1'>
          <Link to={"/wahlen/" + territory + "/"}>
            {TERRITORY_NAMES[territory]}
          </Link>
        </Header>
        <List relaxed>
          {occasions}
        </List>
      </Grid.Column>;
    };

    // Sort German and European elections first
    const occasionElems = [];
    if (this.state.occasions != null) {
      occasionElems.push(occasionElem('deutschland'));
      occasionElems.push(occasionElem('europa'));
      Object.keys(this.state.occasions)
        .filter(o => o !== 'deutschland' && o !== 'europa')
        .forEach(o => occasionElems.push(occasionElem(o)));
    }

    return <Container>
      <SEO title='Metawahl: Alle Wahlen im Überblick' />
      <Grid stackable columns={2} padded relaxed className='occasionList'>
        <Grid.Row>
          <Grid.Column width={4} className='headerCount2'>
            <div className='headerCountInner'><div>{occasionCount > 0 ? occasionCount : 44}</div> Wahlen</div>
          </Grid.Column>
          <Grid.Column width={12}>
            <h3>Bundestags-, Landtags- und Europawahlen in der Übersicht</h3>
            <p>Diese Übersicht zeigt alle Wahlen, zu denen ein Wahl-o-Mat herausgegeben wurde. Das sind leider nicht alle Wahlen, seitdem dieses
            Tool für die Bundestagswahl 2002 das erste Mal produziert wurde. Zu Wahlen
            in Mecklenburg-Vorpommern und Thüringen gab es noch gar keine Ausgabe
            und auch einzelne andere Wahlen, wie die Landtagswahl in Niedersachsen
            2017, sind hier nicht vertreten.</p>
          </Grid.Column>
        </Grid.Row>
        {occasionElems}
      </Grid>
    </Container>;
  }
};
