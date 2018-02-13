// @flow

import React from 'react';
import autoBind from 'react-autobind';

import { OPINION_COLORS } from './Config';

import type { PositionType, ResultType } from './Types';

import './PositionChart.css';

const valueNames = {
  "1": "pro",
  "0": "neutral",
  "-1": "contra"
};

// Gap between colored rectangles
const gapWidth = 1;

type RectProps = {
  toggleOpen: () => any,
  handleHover: (party: ?string) => any,
  hovered: boolean,
  width: number,
  xPos: number,
  ...PositionType
};

const Rect = ({party, value, toggleOpen, handleHover, hovered, width, xPos}: RectProps) => {
  // Changing SVG classnames with react is buggy, therefore this inline
  // style for a hover effect
  const baseStyle = {
    fill: OPINION_COLORS[value],
    fillOpacity: 1.0
  };

  const style = hovered ? Object.assign(baseStyle, {
    fillOpacity: 0.45
  }) : baseStyle;

  return <rect
    className={"rect rect-" + valueNames[value.toString()]}
    height="100%"
    onClick={() => toggleOpen()}
    onMouseOver={() => handleHover(party)}
    onMouseOut={() => handleHover(undefined)}
    style={style}
    width={width}
    x={xPos.toString() + "px"}
  ></rect>;
};

type Props = {
  positions: Array<PositionType>,
  results: ResultType,
  toggleOpen: (party: string) => any
};

type State = {
  parties: Array<PositionType>,
  hovered?: string
};

export default class PositionChart extends React.Component<Props, State> {
  svg: SVGSVGElement;

  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      parties: []
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
      // First sort into pro, neutral, contra and missing
      if (a.value !== b.value) {
        return a.value === "missing" ? 1
          : b.value === "missing" ? -1
            : a.value < b.value ? 1 : -1;
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
        // Sort by name if all else is equal
        return a.party > b.party ? 1 : -1;
      }
    }

    // Merge election results with WoM positions
    this.setState({parties: Object.keys(this.props.results)
      .map(party => {
        const linked_position = this.props.results[party]["linked_position"] || party;
        const rv = Object.assign({},
          this.props.results[party],
          this.props.positions
            .filter(pos => pos.party === linked_position || pos.party === party).shift()
            || { party, value: 'missing' },
          { party }
        );
        return rv;
      })
      .sort(sortPositions)});
  }

  render() {
    let usablePixels = this.svg && this.svg.clientWidth
      - (gapWidth * (this.state.parties.length - 1));

    let usedPixels = 0;

    const rectangles = this.state.parties.map(party => {
      const width = Math.round(party["pct"]
        * usablePixels / 100.0);
      usedPixels += width + gapWidth;

      return usablePixels == null ? null : <Rect
        key={"rect-" + party.party}
        hovered={this.state.hovered === party.party}
        handleHover={this.handleHover}
        width={width}
        xPos={usedPixels - width - gapWidth}
        toggleOpen={() => this.props.toggleOpen(party)}
        {...party} />
    });

    const partyNames = this.state.parties && this.state.parties.slice()
      .sort((a, b) => a.party > b.party ? 1 : -1)
      .map((party: PositionType) => <span
        key={"label-" + party.party}
        onMouseOver={() => this.handleHover(party.party)}
        onMouseOut={() => this.handleHover(undefined)}
        onClick={() => this.props.toggleOpen(party)}
        style={this.state.hovered === party.party ? {
          backgroundColor: OPINION_COLORS[party.value],
          color: "white"
        } : null}
      >{ party["name"] || party.party}</span>);

    return <div>
      <svg role="img" width="100%" height="21" className="positionChart"
        ref={ref => this.svg = ref} >
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
