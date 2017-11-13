import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';

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
    let proParties = this.props.positions.filter(p => p.value === 1);
    let neutralParties = this.props.positions.filter(p => p.value === 0);
    let contraParties = this.props.positions.filter(p => p.value === -1);

    let showPro = proParties.length > 0
      ? <div className="position_values">Pro: {proParties.map(p =>
          <span key={p.party} onClick={() => this.toggleOpen(p)}>{p.party}, </span>
        )}</div> : null;

    let showNeutral = neutralParties.length > 0
      ? <div className="position_values">Neutral: {neutralParties.map(p =>
          <span key={p.party} onClick={() => this.toggleOpen(p)}>{p.party}, </span>
        )}</div> : null;

    let showContra = contraParties.length > 0
      ? <div className="position_values">Contra: {contraParties.map(p =>
          <span key={p.party} onClick={() => this.toggleOpen(p)}>{p.party}, </span>
        )}</div> : null;

    const positionText = this.state.openText == undefined || this.props.loaded === false
      ? null : <p>Position der {this.state.openText.party}: {this.state.openText.text}</p>;

    return <li>
      {this.props.title.length > 0 &&
        <span>
        <h2>{this.props.title}</h2>
        <h4>{this.props.text}</h4>
        </span>
      }

      {this.props.title.length == 0 &&
        <h2>
          <span style={{marginLeft: 5}}>{this.props.text}</span>
        </h2>
      }

      <em>{this.props.id}</em>&nbsp;
      <p>
        {showPro}
        {showNeutral}
        {showContra}
      </p>
      {positionText}
    </li>
  }
}
