import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';

export default class OccasionList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    const territories = {};
    this.props.occasions.map(occasion => {
      if (territories[occasion.occasion.territory] == undefined) {
        territories[occasion.occasion.territory] = [];
      }

      territories[occasion.occasion.territory].push(occasion);
    });

    const occasions = Object.keys(territories)
      .sort()
      .map(territory => {
        const occasions = territories[territory]
          .sort((a, b) => a.occasion.title > b.occasion.title)
          .map(occasion => <li key={occasion.occasion.title}>
            <a onClick={() => this.props.navigate("Wahl", occasion.occasion.num)}>
              {occasion.occasion.title}
            </a>
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
