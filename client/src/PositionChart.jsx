// @flow

import React from 'react';
import autoBind from 'react-autobind';

import type { PositionType, ResultType } from './Types';

import './PositionChart.css';

const valueNames = {
  "1": "pro",
  "0": "neutral",
  "-1": "contra"
};

type Props = {
  positions: Array<PositionType>,
  results: ResultType,
  toggleOpen: (party: string) => any
};

type State = {
  positions: Array<PositionType>,
  hovered?: string
};

export default class PositionChart extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      positions: []
    }
  }

  componentWillMount() {
    this.sortPositions();
  }

  handleHover(party?: string) {
    if (this.state.hovered !== party) {
      this.setState({
        hovered: party
      });
    }
  }

  sortPositions() {
    const res = this.props.results;
    const sortPositions = (a, b) => {
      // First sort into pro, neutral, contra
      if (a.value !== b.value) {
        return a.value < b.value ? 1 : -1;
      } else {
        // Then sort descending by vote count
        if (res != null) {
          // Sort last if vote count unknown
          if (res[a.party] == null) return 1;
          if (res[b.party] == null) return -1;

          if (res[a.party]["votes"] !== res[b.party]["votes"]) {
            return res[a.party]["votes"] > res[b.party]["votes"] ? -1 : 1;
          }
        }
        // Sort by name otherwise
        return a.party > b.party ? 1 : -1;
      }
    }
    this.setState({positions: this.props.positions.sort(sortPositions)});
  }

  render() {
    const t = this;

    // Place rectangles from left to right, counting the used space
    // for absolute positioning
    let usedPct = 0.0;

    const Rect = ({party, value, toggleOpen}: {toggleOpen: () => any, ...PositionType}) => {
      const result = t.props.results[party] && t.props.results[party]["pct"];
      if (result == null) { console.log("No vote count for " + party); return null;}
      usedPct += result || 0;

      // Changing SVG classnames with react is buggy, therefore this inline
      // style for a hover effect
      const style = t.state.hovered === party ? {
        fillOpacity: 0.45
      } : null;

      return <rect
        className={"rect rect-" + valueNames[value.toString()]}
        height="100%"
        onClick={() => toggleOpen()}
        onMouseOver={() => this.handleHover(party)}
        onMouseOut={() => {this.handleHover(undefined)}}
        style={style}
        width={"" + result + "%" || 0}
        x={(usedPct - result).toString() + "%"}
      ></rect>;
    };

    const rectangles = this.state.positions.map(
      pos => <Rect
        toggleOpen={() => t.props.toggleOpen(pos)}
        key={"rect-" + pos.party} {...pos} />
    );

    const partyNames = this.state.positions && this.state.positions.slice()
      .sort((a, b) => a.party > b.party ? 1 : -1)
      .map((pos: PositionType) => <span
        key={"label-" + pos.party}
        onMouseOver={() => this.handleHover(pos.party)}
        onMouseOut={() => this.handleHover(undefined)}
        onClick={() => this.props.toggleOpen(pos)}
        style={t.state.hovered === pos.party ? {
          backgroundColor: "black", color: "white"
        } : null}
      >{pos.party}</span>);

    return <div>
      <svg role="img" width="100%" height="21" className="positionChart">
         <g className="bar">
          {rectangles}
        </g>
      </svg>

      <div className="partyNames">
        {partyNames}
      </div>
    </div>
  }
}
