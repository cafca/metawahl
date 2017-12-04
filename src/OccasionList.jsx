// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Segment } from 'semantic-ui-react';

import { RouteProps } from './Types';

export default class OccasionList extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
  }

  render() {
    const territories = {};

    // Make object that maps each territory to its occasions
    this.props.occasions && Object.keys(this.props.occasions).forEach(occasionNum => {
      const terr = this.props.occasions[occasionNum].occasion.territory;
      if (territories[terr]) {
        territories[terr].push(this.props.occasions[occasionNum]);
      } else {
        territories[terr] = [this.props.occasions[occasionNum]];
      }
    });

    const occasions = Object.keys(territories)
      .sort()
      .map(territory => {
        const occasions = territories[territory]
          .sort((a, b) => a.occasion.title > b.occasion.title)
          .map(occasion => <Segment key={occasion.occasion.title}>
            <Link to={`/wahlen/${occasion.occasion.num}/`}>
              {occasion.occasion.title}
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
