// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import moment from 'moment';

import '../../index.css';
import { Link } from 'react-router-dom';
import { Grid, Header, List, Responsive } from 'semantic-ui-react';

import { TERRITORY_NAMES } from '../../config/';
import { OccasionListType, RouteProps } from '../../types/';
import MapComponent from '../../components/map/';
import SEO from '../../components/seo/';

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
    const occasionElem = territory => {
      const occasions = this.state.occasions[territory] != null && this.state.occasions[territory]
        .sort((a, b) => a.date < b.date)
        .map(occasion => <List.Item key={occasion.id} as='a'
            href={`/wahlen/${occasion.territory}/${occasion.id}/`}
            className='occasionListItem'>
          <List.Header as='h3'>{moment(occasion.date).year()}</List.Header>
          <span style={{color: 'rgb(140, 140, 140)'}}>
            {occasion.title.slice(0, occasion.title.indexOf(' '))} vom {moment(occasion.date).format('LL')}
          </span>
        </List.Item>);

      return <div className="ui container" key={territory} style={{marginTop: "4em"}}>
        <Header dividing as='h1' style={{marginBottom: "1em"}}>
          <Link to={"/wahlen/" + territory + "/"}>{TERRITORY_NAMES[territory]}</Link>
        </Header>
        <Grid columns='2'>
          <Responsive minWidth={601} className='four wide column'>
            <MapComponent territory={territory} style={{maxHeight: "10em"}} />
          </Responsive>
          <Responsive maxWidth={600} className='six wide column'>
            <MapComponent territory={territory} style={{maxHeight: "10em"}} />
          </Responsive>
          <Grid.Column width='10'>
            <List relaxed='very'>
              {occasions}
            </List>
          </Grid.Column>
        </Grid>
      </div>;
    };

    // Sort German and European elections first
    const occasionElems = [];
    if (this.state.occasions != null) {
      occasionElems.push(occasionElem('deutschland'))
      occasionElems.push(occasionElem('europa'))

      Object.keys(this.state.occasions)
        .filter(o => o !== 'deutschland' && o !== 'europa')
        .map(o => occasionElems.push(occasionElem(o)));
    }

    return <div className="occasionList">
        <SEO title='Metawahl: Alle Wahlen und Parlamente im Überblick' />
        <Header as='h1'>
          Alle Wahlen und Parlamente
          <Header.Subheader>
            Bundestags-, Landtags- und Europawahlen in der Übersicht
          </Header.Subheader>
        </Header>
        {occasionElems}
      </div>;
  }
};
