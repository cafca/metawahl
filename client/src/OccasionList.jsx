// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Segment } from 'semantic-ui-react';

import { API_ROOT } from './Config';
import { OccasionListType, RouteProps, ErrorState } from './Types';

type State = {
  occasions: OccasionListType,
  occasionsState: ErrorState
};

export default class OccasionList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      occasions: [],
      occasionsState: "loading"
    }
  }

  componentDidMount() {
    this.loadOccasions();
  }

  loadOccasions(): void {
    fetch(`${API_ROOT}/occasions/`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          occasions: response.data,
          occasionsState: "success"
        });
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            occasions: [],
            occasionsState: "error"
          });
        }
      }
    );
  }

  render() {
    const occasions = Object.keys(this.state.occasions)
      .sort()
      .map(territory => {
        const occasions = this.state.occasions[territory]
          .sort((a, b) => a.title > b.title)
          .map(occasion => <Segment key={occasion.id}>
            <Link to={`/wahlen/${occasion.id}/`}>
              {occasion.title} {new Date(occasion.date).getFullYear()}
            </Link>
          </Segment>);

        return <div className="territory" key={territory}>
          <h2>{_.startCase(territory)}</h2>
          <Segment.Group>
            {occasions}
          </Segment.Group>
        </div>;
      });

    return this.props.occasionsState === "loading" ? <p>Loading occasions...</p> :
      <div className="occasionList">
        <h1>Wahlen</h1>
        <div>
          {occasions}
        </div>
      </div>;
  }
};
