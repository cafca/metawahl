// @flow

import React from 'react';
import autoBind from 'react-autobind';

import { OPINION_COLORS } from '../../config/';

import type { MergedPartyDataType } from '../../types/';

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
  toggleOpen: (party: string) => any,
  compact?: boolean // set to true to restrict width to 70% and hide party names
};

type State = {
  parties: Array<MergedPartyDataType>,
  hovered: ?string,
  width: number
};

export default class PositionChart extends React.Component<Props, State> {
  svg = null;
  measuringTimeout = null;

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
    window.addEventListener('resize', this.waitAndMeasureSVGWidth);
  }

  componentDidUpdate() {
    this.waitAndMeasureSVGWidth();
  }

  componentWillUnMount() {
    if (this.measuringTimeout != null) clearTimeout(this.measuringTimeout);
  }

  handleHover(party: ?string) {
    if ( this.state.hovered !== party) {
      this.setState({ hovered: party });
    }
  }

  handleRef(ref: ?SVGSVGElement) {
    this.svg = ref;
  }

  waitAndMeasureSVGWidth() {
    if (this.measuringTimeout != null) clearTimeout(this.measuringTimeout);
    this.measuringTimeout = setTimeout(this.measureSVGWidth, 500);
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

    if (usablePixels != null && usablePixels > 0) {
      let usedPixels = 0;

      // Parties with less than 0.1 % of votes are not visible in the chart
      // anyway
      rectangles = this.state.parties.filter(d => d.pct > 0.1).map((data: MergedPartyDataType) => {
        const width = Math.round(data.pct * usablePixels / 100.0);
        usedPixels += width + gapWidth;

        return <g>
          <Rect
          key={"rect-" + data.party}
          hovered={this.state.hovered === data.party}
          handleHover={this.handleHover}
          width={width}
          xPos={usedPixels - width - gapWidth}
          toggleOpen={() => this.props.toggleOpen(data)}
          {...data} />
            { data.pct > 5 && this.props.compact === true &&
            <text
              x={usedPixels - width - gapWidth + 5}
              y={'60%'} width={width}
              style={{fill: 'white', opacity: 0.5}}>
                {data.party}
            </text>
            }
        </g>
      });
    }

    const partyNames = this.state.parties && this.state.parties.slice()
      .sort((a, b) => a.party > b.party ? 1 : -1)
      .map((data: MergedPartyDataType) => <span
        key={"label-" + data.party}
        onMouseOver={() => this.handleHover(data.party)}
        onMouseOut={() => this.handleHover(null)}
        onClick={() => this.props.toggleOpen(data)}
        className={data.text == null ? "noText" : null}
        style={this.state.hovered === data.party ? {
          backgroundColor: OPINION_COLORS[data.value],
          color: "white"
        } : null}
      >{ data.party }</span>);

    const svgWidthString = this.props.compact === true ? "65%" : "100%"
    const svgHeightString = this.props.compact === true ? "35" : "21"
    const svgStyle = this.props.compact === true ? {} : {
      margin: "0.3em 0"
    }

    return <span>
      <svg width={svgWidthString} height={svgHeightString} className="positionChart"
        ref={this.handleRef} shapeRendering="crispEdges" style={svgStyle}>
         <g className="bar">
          {rectangles}
        </g>
      </svg>

      { this.props.compact != true &&
        <div className="partyNames">
          {partyNames}
        </div>
      }

    </span>
  }
}
