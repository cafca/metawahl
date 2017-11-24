import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Link } from 'react-router-dom';

export default class Occasion extends React.Component {
  occasionNum;

  constructor(props) {
    super(props);
    autoBind(this);
    this.occasionNum = this.props.match.params.occasionNum;
    this.state =  {
      occasion: null,
      theses: []
    }
  }

  componentDidMount() {
    this.makeStateFromProps(this.props);
    this.props.loadPositions(this.occasionNum);
  }

  componentWillReceiveProps(nextProps) {
    this.makeStateFromProps(nextProps);
  }

  makeStateFromProps(props) {
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

    return <div>
      <h1><Link to="/">Wahlen</Link> > {this.state.occasion == null ? "Loading..." : this.state.occasion.occasion.title}</h1>
      <h3>Thesen</h3>
      <ul className="theses">
        {thesesElems}
      </ul>
    </div>;
  }
}
