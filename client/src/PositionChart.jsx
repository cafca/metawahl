// @flow

import React from 'react';
import autoBind from 'react-autobind';

import { OPINION_COLORS } from './Config';

import type { MergedPartyDataType } from './Types';

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
  ...MergedPartyDataType
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
  parties: MergedPartyDataType,
  toggleOpen: (party: string) => any
};

type State = {
  parties: Array<PositionType>,
  hovered: ?string,
  width: number
};

export default class PositionChart extends React.Component<Props, State> {
  svg = null;

  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      parties: [],
      hovered: null,
      width: 0
    }
  }

  componentWillMount() {
    this.sortPositions();
  }

  componentDidMount() {
    this.measureSVGWidth();
  }

  componentDidUpdate() {
    this.measureSVGWidth();
  }

  handleHover(party: ?string) {
    if ( this.state.hovered !== party) {
      this.setState({ hovered: party });
    }
  }

  handleRef(ref) {
    this.svg = ref;
  }

  measureSVGWidth() {
    if (this.svg != null) {
      const { width } = this.svg.getBoundingClientRect();
      this.setState({ width });
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    return (
      this.state.width !== nextState.width ||
      this.state.hovered !== nextState.hovered
    );
  }

  sortPositions() {
    const sortPositions = (a, b) => {
      // First sort into pro, neutral, contra and missing
      if (a.value !== b.value) {
        return a.value === "missing" ? 1 : b.value === "missing" ? -1
            : a.value < b.value ? 1 : -1;
      } else {
        // Sort last if vote count unknown
        if (a.votes == null) return 1;
        if (b.votes == null) return -1;

        // Then sort descending by vote count
        if (a.votes !== b.votes) {
          return a.votes > b.votes ? -1 : 1;
        }

        // Sort by name if all else is equal
        return a.party > b.party ? 1 : -1;
      }
    }

    // Merge election results with WoM positions
    this.props.parties && this.setState({
      parties: this.props.parties.sort(sortPositions)
    });
  }

  render() {
    let rectangles = [];
    const combinedGapWidth = gapWidth * (this.state.parties.length - 1);
    const usablePixels = this.state.width - combinedGapWidth;

    if (usablePixels == null) {
      console.log("SVG Dimensions not detected");
    } else {
      console.log("Rerender with svg dimensions");
      let usedPixels = 0;

      rectangles = this.state.parties.map((data: MergedPartyDataType) => {
        const width = Math.round(data.pct * usablePixels / 100.0);
        usedPixels += width + gapWidth;

        return <Rect
          key={"rect-" + data.party}
          hovered={this.state.hovered === data.party}
          handleHover={this.handleHover}
          width={width}
          xPos={usedPixels - width - gapWidth}
          toggleOpen={() => this.props.toggleOpen(data)}
          {...data} />
      });
    }

    const partyNames = this.state.parties && this.state.parties.slice()
      .sort((a, b) => a.party > b.party ? 1 : -1)
      .map((data: MergedPartyDataType) => <span
        key={"label-" + data.party}
        onMouseOver={() => this.handleHover(data.party)}
        onMouseOut={() => this.handleHover(null)}
        onClick={() => this.props.toggleOpen(data)}
        style={this.state.hovered === data.party ? {
          backgroundColor: OPINION_COLORS[data.value],
          color: "white"
        } : null}
      >{ data.party }</span>);

    return <div>
      <svg width="100%" height="21" className="positionChart"
        ref={this.handleRef} >
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
