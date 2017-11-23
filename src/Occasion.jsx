import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Link } from 'react-router-dom';

export default class Occasion extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state =  {
      occasion: null,
      occasionNum: this.props.match.params.occasionNum,
      theses: []
    }
  }

  componentDidMount() {
    this.makeStateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.makeStateFromProps(nextProps);
  }

  makeStateFromProps(props) {
    const occasion = props.occasions[this.state.occasionNum];
    const theses = occasion ? occasion.theses : [];
    this.setState({occasion, theses});
  }

  render() {
    const thesesElems = this.state.theses.map((t, i) => {
      // Set to positionTexts entry once loaded
      const positions = this.props.positions[this.state.occasionNum]
        ? this.props.positions[this.state.occasionNum][t.id] : t.positions;

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
