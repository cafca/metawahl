// @flow

import React from "react";
import autoBind from "react-autobind";
import { Header } from "semantic-ui-react";

import CompactThesis from "../../components/thesis/compact";
import { RouteProps, ThesisType, OccasionType } from "../../types/";
import Legend from "../../components/legend/";
import { extractThesisID } from "../../utils/thesis";

import "./styles.css";

type Props = {
  territory: string,
  occasionNum: number,
  occasion: ?OccasionType,
  theses: Array<ThesisType>
};

type State = {};

export default class Occasion extends React.Component<Props, State> {
  territory: string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.thesisRefs = {};
  }

  getRatio({ title, positions }, reverse = false) {
    // Determine the ratio of positive votes by summing up the vote results
    // of all parties with positive answers
    if (this.props.occasion === null) return null;

    const occRes = this.props.occasion.results;

    // Combine results if multiple parties correspond to an entry (CDU + CSU => CDU/CSU)
    // otherwise just return accumulator `acc` + result of party `cur`
    const countVotes = (acc, cur) => {
      if (occRes[cur["party"]] == null) {
        let multipleLinkedResults = Object.keys(occRes).filter(
          k => occRes[k].linked_position === cur["party"]
        );
        return (
          acc +
          multipleLinkedResults
            .map(k => occRes[k]["pct"])
            .reduce((acc, cur) => acc + cur, 0.0)
        );
      } else {
        return acc + occRes[cur["party"]]["pct"];
      }
    };

    const ratio = positions
      .filter(p => (reverse ? p.value === -1 : p.value === 1))
      .reduce(countVotes, 0.0);
    return ratio;
  }

  render() {
    let thesesElems = this.props.theses
      .sort((a, b) => (this.getRatio(a) > this.getRatio(b) ? -1 : 1))
      .map((t, i) => {
        const tRatio = this.getRatio(t);
        const tUrl = `/wahlen/${this.props.territory}/${
          this.props.occasionNum
        }/${extractThesisID(t.id).thesisNUM}/`;

        return (
          <div key={"thesis-compact-" + i} className="thesis-compact">
            <a href={tUrl}>
              <CompactThesis key={t.id} occasion={this.props.occasion} {...t} />
              <span className="thesisTitleInsert">
                <strong>
                  {tRatio < 1 ? "<1" : tRatio > 99 ? ">99" : Math.round(tRatio)}
                  &nbsp;von 100 wählen <em>{t.title}</em>:
                </strong>
                &nbsp;
                {t.text}
              </span>
            </a>
          </div>
        );
      });

    return (
      <div className="occasion-component">
        <Header as="h1">
          {this.props.title != null
            ? this.props.title
            : this.props.occasion == null
              ? " "
              : this.props.occasion.preliminary
                ? "Welche Politik wird voraussichtlich bei der " +
                  this.props.occasion.title +
                  " gewählt?"
                : "Welche Politik wurde bei der " +
                  this.props.occasion.title +
                  " gewählt?"}
          {this.props.occasion != null && (
            <Header.Subheader>
              {this.props.occasion.preliminary
                ? "Die Grafik zeigt, welcher Stimmanteil laut Wahlprognosen an Parteien geht, die sich im Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben"
                : "Die Grafik zeigt, welcher Stimmanteil an Parteien ging, die sich vor der Wahl für eine These ausgesprochen haben."}
            </Header.Subheader>
          )}
        </Header>

        <Legend text="Partei war im Wahl-o-Mat:" />

        {/* Main content */}
        {thesesElems.length > 0 && <div className="theses">{thesesElems}</div>}
      </div>
    );
  }
}
