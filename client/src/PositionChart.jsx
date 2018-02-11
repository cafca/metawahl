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
  positions: Array<PositionType>,
  hovered?: string
};

export default class PositionChart extends React.Component<Props, State> {
  svg: SVGSVGElement;

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
        // Sort by name if all else is equal
        return a.party > b.party ? 1 : -1;
      }
    }
    this.setState({positions: this.props.positions
      .filter(pos => this.props.results[pos.party] && this.props.results[pos.party]["pct"])
      .sort(sortPositions)});
  }

  render() {
    let usablePixels = this.svg && this.svg.clientWidth
      - (gapWidth * (this.state.positions.length - 1));

    let usedPixels = 0;

    const rectangles = this.state.positions.map(pos => {
      const width = Math.round(this.props.results[pos.party]["pct"]
        * usablePixels / 100.0);
      usedPixels += width + gapWidth;

      return usablePixels == null ? null : <Rect
        key={"rect-" + pos.party}
        hovered={this.state.hovered === pos.party}
        handleHover={this.handleHover}
        width={width}
        xPos={usedPixels - width - gapWidth}
        toggleOpen={() => this.props.toggleOpen(pos)}
        {...pos} />
    });

    const partyNames = this.state.positions && this.state.positions.slice()
      .sort((a, b) => a.party > b.party ? 1 : -1)
      .map((pos: PositionType) => <span
        key={"label-" + pos.party}
        onMouseOver={() => this.handleHover(pos.party)}
        onMouseOut={() => this.handleHover(undefined)}
        onClick={() => this.props.toggleOpen(pos)}
        style={this.state.hovered === pos.party ? {
          backgroundColor: OPINION_COLORS[pos.value],
          color: "white"
        } : null}
      >{pos.party}</span>);

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
