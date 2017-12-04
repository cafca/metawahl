// @flow

import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Link } from 'react-router-dom';
import { Segment } from 'semantic-ui-react';

import { RouteProps, ThesisType, OccasionType } from './Types';

type State = {
  occasion: ?OccasionType,
  theses: Array<ThesisType>
};

export default class Occasion extends React.Component<RouteProps, State> {
  occasionNum: number;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.occasionNum = parseInt(this.props.match.params.occasionNum, 10);
    this.state =  {
      occasion: null,
      theses: []
    }
  }

  componentDidMount() {
    this.makeStateFromProps(this.props);
    this.props.loadPositions(this.occasionNum);
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    this.makeStateFromProps(nextProps);
  }

  makeStateFromProps(props: RouteProps) {
    const occasion = props.occasions[this.occasionNum];
    const theses = occasion ? occasion.theses : [];
    this.setState({occasion, theses});
  }

  render() {
    const thesesElems = this.state.theses.map((t, i) => {
      // Set to positionTexts entry once loaded
      const positions = this.props.positions[this.occasionNum]
        ? this.props.positions[this.occasionNum][t.id] : t.positions;

      return <Thesis
        key={t.id}
        loaded={this.props.positions != null}
        {...t}
        positions={positions}
      />
    });

    return <div className="occasion">
      <h1>
        <Link to="/">Wahlen</Link>
        >
        { this.state.occasion == null
          ? "Loading..." : this.state.occasion.occasion.title }
      </h1>

      {this.state.occasion == null &&
      <Segment loading style={{ minHeight: 100 }}></Segment>
      }

      {this.state.occasion != null &&
      <div className="theses">
        {thesesElems}
      </div>
      }
    </div>;
  }
}
