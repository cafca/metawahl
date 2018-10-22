// @flow

import React from "react";
import autoBind from "react-autobind";

import { OPINION_COLORS } from "../../config/";

import type { MergedPartyDataType } from "../../types/";

import "./PositionChart.css";

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

const Rect = ({
  party,
  value,
  toggleOpen,
  handleHover,
  hovered,
  width,
  xPos,
  compact
}: RectProps) => {
  // Changing SVG classnames with react is buggy, therefore this inline
  // style for a hover effect
  const baseStyle = {
    fill: OPINION_COLORS[value],
    fillOpacity: 1.0
  };

  const style =
    hovered && compact !== true
      ? Object.assign(baseStyle, { fillOpacity: 0.45 })
      : baseStyle;

  return (
    <rect
      className={"rect rect-" + valueNames[value.toString()]}
      height="100%"
      onClick={() => toggleOpen()}
      onMouseOver={() => handleHover(party)}
      onMouseOut={() => handleHover(undefined)}
      style={style}
      width={width}
      x={xPos.toString() + "px"}
    />
  );
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
    };
  }

  componentWillMount() {
    this.sortPositions();
  }

  componentDidMount() {
    this.measureSVGWidth();
    window.addEventListener("resize", this.waitAndMeasureSVGWidth);
  }

  componentDidUpdate() {
    this.waitAndMeasureSVGWidth();
  }

  componentWillUnMount() {
    if (this.measuringTimeout != null) clearTimeout(this.measuringTimeout);
  }

  handleHover(data: ?MergedPartyDataType) {
    const party = data && data.party;
    if (this.state.hovered !== party) {
      this.setState({ hovered: party });
      if (party) this.props.toggleOpen(data);
    }
  }

  handleRef(ref: ?SVGSVGElement) {
    this.svg = ref;
  }

  waitAndMeasureSVGWidth() {
    if (this.measuringTimeout != null) clearTimeout(this.measuringTimeout);
    this.measuringTimeout = setTimeout(this.measureSVGWidth, 50);
  }

  makeRectangles(usablePixels, usedPixels) {
    const rectangles = this.state.parties
      .filter(d => d.pct > 0.1)
      .map((data: MergedPartyDataType) => {
        const width = Math.round((data.pct * usablePixels) / 100.0);
        usedPixels += width + gapWidth;
        return (
          <g key={"rect-" + data.party}>
            <Rect
              hovered={this.state.hovered === data.party}
              handleHover={() => this.handleHover(data)}
              width={width}
              xPos={usedPixels - width - gapWidth}
              toggleOpen={() => this.props.toggleOpen(data)}
              compact={this.props.compact}
              {...data}
            />
            {data.pct >= 5 && (
              <text
                x={usedPixels - width - gapWidth + 5}
                y={"66%"}
                width={width}
                onClick={() => this.props.toggleOpen(data)}
                onMouseOver={() => this.handleHover(data)}
                onMouseOut={() => this.handleHover(null)}
                style={{
                  fill: "white",
                  opacity: 0.7,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
              <tspan x={usedPixels - width - gapWidth + 10} y="40%" style={{fontWeight: "bold"}}>{data.party}</tspan>
              <tspan x={usedPixels - width - gapWidth + 10} y="80%">{parseInt(data.pct, 10)}%</tspan>
              {/* {data.party} {data.pct}% */}
              </text>
            )}
          </g>
        );
      });
    return { rectangles, usedPixels };
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
        return a.value === "missing" ? 1
          : b.value === "missing" ? -1
            : a.value < b.value ? 1
              : -1;
      } else {
        // Sort last if vote count unknown
        if (a.pct == null) return 1;
        if (b.pct == null) return -1;

        // Then sort descending by vote count
        if (a.pct !== b.pct) {
          return a.pct > b.pct ? -1 : 1;
        } else if (a.votes != null && b.votes != null && a.votes !== b.votes) {
          return a.votes > b.votes ? -1 : 1;
        }

        // Sort by name if all else is equal
        return a.party > b.party ? 1 : -1;
      }
    };

    // Merge election results with WoM positions
    this.props.parties &&
      this.setState({
        parties: this.props.parties.sort(sortPositions)
      });
  }

  responsiveSVGStyle() {
    let svgWidthString;
    let svgHeightString;
    let svgStyle = {};
    svgWidthString = "100%";
    svgHeightString = "40";
    svgStyle = {
      margin: "0.3em 0"
    };
    return { svgWidthString, svgHeightString, svgStyle };
  }

  render() {
    let rectangles = [];
    const combinedGapWidth = gapWidth * (this.state.parties.filter(d => d.pct > 0.1).length - 1);
    const usablePixels = this.state.width - combinedGapWidth;

    if (usablePixels != null && usablePixels > 0) {
      let usedPixels = 0;

      // Parties with less than 0.1 % of votes are not visible in the chart
      // anyway
      ({ rectangles, usedPixels } = this.makeRectangles(
        usablePixels,
        usedPixels
      ));
    }

    // Responsive dimensions of SVG elem
    let {
      svgWidthString,
      svgHeightString,
      svgStyle
    } = this.responsiveSVGStyle();

    return (
      <span className="positionChartContainer">
        <svg
          width={svgWidthString}
          height={svgHeightString}
          className="positionChart"
          ref={this.handleRef}
          shapeRendering="crispEdges"
          style={svgStyle}
        >
          <g className="bar">{rectangles}</g>
        </svg>
      </span>
    );
  }
}
