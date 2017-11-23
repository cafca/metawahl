import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import { Link } from 'react-router-dom';

export default class OccasionList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    const territories = {};

    // Make object that maps each territory to its occasions
    Object.keys(this.props.occasions).forEach(occasionNum => {
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
          .map(occasion => <li key={occasion.occasion.title}>
            <Link to={`/wahlen/${occasion.occasion.num}/`}>
              {occasion.occasion.title}
            </Link>
          </li>);

        return <div className="territory" key={territory}>
          <h2>{_.startCase(territory)}</h2>
          <ul>
            {occasions}
          </ul>
        </div>;
      });

    return this.props.occasionsState === "loading" ? <p>Loading occasions...</p> :
      <div>
        <h1>Wahlen</h1>
        <ul>
          {occasions}
        </ul>
      </div>;
  }
};
