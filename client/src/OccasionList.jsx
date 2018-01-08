// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment } from 'semantic-ui-react';

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
    const occasions = this.state.occasions && Object.keys(this.state.occasions)
      .sort()
      .map(territory => {
        const occasions = this.state.occasions && this.state.occasions[territory]
          .sort((a, b) => a.title > b.title)
          .map(occasion => <Segment key={occasion.id}>
            <Link to={`/wahlen/${occasion.id}/`}>
              {occasion.title} {new Date(occasion.date).getFullYear()}
            </Link>
          </Segment>);

        return <div className="territory" key={territory}>
          <h2><Link to={"/gebiete/" + territory + "/"}>{TERRITORY_NAMES[territory]}</Link></h2>
          <Segment.Group>
            {occasions}
          </Segment.Group>
        </div>;
      });

    return <div className="occasionList">
        <h1>Wahlen</h1>
        <div>
          {occasions}
        </div>
      </div>;
  }
};
