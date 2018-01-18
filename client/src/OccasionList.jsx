// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Header, Icon } from 'semantic-ui-react';

import { API_ROOT, setTitle, TERRITORY_NAMES } from './Config';
import { loadFromCache, saveToCache } from './App';
import { OccasionListType, RouteProps } from './Types';

type State = {
  occasions: ?OccasionListType
};

export default class OccasionList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = { occasions: null };
  }

  componentDidMount() {
    const savedOccasions = loadFromCache('occasions');
    if (savedOccasions != null) this.setState(
      { occasions: JSON.parse(savedOccasions)});
    this.loadOccasions();
    setTitle();
  }

  loadOccasions(): void {
    fetch(`${API_ROOT}/occasions/`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          occasions: response.data
        });
        saveToCache('occasions', JSON.stringify(response.data));
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            occasions: []
          });
        }
      }
    );
  }

  render() {
    const occasions = this.state.occasions != null && Object.keys(this.state.occasions)
      .sort()
      .map(territory => {
        const occasions = this.state.occasions[territory]
          .sort((a, b) => a.date > b.date)
          .map(occasion => <Segment key={occasion.id}>
            <Link to={`/wahlen/${occasion.territory}/${occasion.id}/`}>
              {occasion.title}
            </Link>
          </Segment>);

        return <div className="territory" key={territory}>
          <h2><Link to={"/wahlen/" + territory + "/"}>{TERRITORY_NAMES[territory]}</Link></h2>
          <Segment.Group>
            {occasions}
          </Segment.Group>
        </div>;
      });

    return <div className="occasionList">
        <Header as='h1'>
          <Icon  name='university' />
          <Header.Content>
            Metawahl
            <Header.Subheader>Der Wahl-o-Mat im Nachhinein: 16 Jahre Wahlkampfthemen zeigen die Entwicklung der politischen Landschaft in Deutschland und fordern kritische Retrospektive.</Header.Subheader>
          </Header.Content>
        </Header>
        <h2>Wahlen</h2>
        <div>
          {occasions}
        </div>
      </div>;
  }
};
