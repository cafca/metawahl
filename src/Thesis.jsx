import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';

const Position = (p) => {
  const hasText = p.text && p.text.length > 0;
  return <span
    onClick={hasText ? () => p.toggleOpen(p) : null}
    className={hasText ? "positionWithText" : null}
  >
    {p.party},&nbsp;
  </span>
}

const Positions = ({positions, value, toggleOpen}) => positions.length === 0 ? null
  : <div className="position_values">
      {value}: {positions.map(p => <Position toggleOpen={toggleOpen} key={p.party} {...p} />)}
    </div>

export default class Thesis extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null
    }
  }

  toggleOpen(party) {
    this.setState({openText: party});
  }

  render() {
    let proPositions = this.props.positions.filter(p => p.value === 1);
    let neutralPositions = this.props.positions.filter(p => p.value === 0);
    let contraPositions = this.props.positions.filter(p => p.value === -1);

    const positionText = this.state.openText == null || this.props.loaded === false
      ? null : <p>Position der {this.state.openText.party}: {this.state.openText.text}</p>;

    const womID = parseInt(this.props.id.split("-")[1], 10);

    return <li id={this.props.id}>
      {this.props.title && this.props.title.length > 0 &&
        <span>
        <Link to={`/wahlen/${womID}/#${this.props.id}`}><h2>{this.props.title}</h2></Link>
        <h4>{this.props.text}</h4>
        </span>
      }

      {(this.props.title == null || this.props.title.length === 0) &&
        <Link to={`/wahlen/${womID}/#${this.props.id}`}><h2>
          <span style={{marginLeft: 5}}>{this.props.text}</span>
        </h2></Link>
      }
      <div className="positionsOverview">
        <Positions value="Pro" positions={proPositions} toggleOpen={this.toggleOpen}/>
        <Positions value="Neutral" positions={neutralPositions} toggleOpen={this.toggleOpen}/>
        <Positions value="Contra" positions={contraPositions} toggleOpen={this.toggleOpen}/>
      </div>
      {positionText}
    </li>
  }
}
