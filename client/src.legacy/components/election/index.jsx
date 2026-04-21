// @flow

import React from "react"
import autoBind from "react-autobind"
import { Header } from "semantic-ui-react"

import CompactThesis from "../../components/thesis/compact"
import SourcesFooter from "../../components/sourcesFooter"
import { RouteProps, ThesisType, ElectionType } from "../../types/"
import Legend from "../../components/legend/"

import "./styles.css"

const ElectionSubheader = ({ iframe, preliminary, sourceName, numTheses }) => {
  if (numTheses === 0) numTheses = "..."
  let rv
  if (iframe === true) {
    rv =
      preliminary === true
        ? `Für den Wahl-O-Mat wurden alle Parteien gefragt, wie sie zu ${numTheses} Kernfragen
        stehen. So kann man schon jetzt sehen, welche Positionen wahrscheinlich gewählt werden.`
        : `Für den Wahl-O-Mat wurden alle Parteien gefragt, wie sie zu ${numTheses} Kernfragen
        stehen. So kann man jetzt sehen, welche Positionen wirklich gewählt wurden.`
    rv = (
      <span>
        {rv}{" "}
        <em>
          <a href="#methodik">Mehr zur Methode.</a>
        </em>
      </span>
    )
  } else {
    rv =
      preliminary === true
        ? `Hier wird gezeigt, welcher Stimmanteil laut ${sourceName} an Parteien
        gehen wird, die sich im Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben`
        : `Hier wird gezeigt, welcher Stimmanteil an Parteien ging, die sich im
        Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben.`
  }
  return rv
}

type Props = {
  territory: string,
  electionNum: number,
  election: ?ElectionType,
  theses: Array<ThesisType>,
  iframe?: boolean
}

type State = {}

export default class Election extends React.Component<Props, State> {
  territory: string

  constructor(props: RouteProps) {
    super(props)
    autoBind(this)
    this.thesisRefs = {}
  }

  getRatio({ title, positions }, reverse = false) {
    // Determine the ratio of positive votes by summing up the vote results
    // of all parties with positive answers
    if (this.props.election === null) return null

    const occRes = this.props.election.results

    // Combine results if multiple parties correspond to an entry (CDU + CSU => CDU/CSU)
    // otherwise just return accumulator `acc` + result of party `cur`
    const countVotes = (acc, cur) => {
      if (occRes[cur["party"]] == null) {
        let multipleLinkedResults = Object.keys(occRes).filter(
          k => occRes[k].linked_position === cur["party"]
        )
        return (
          acc +
          multipleLinkedResults
            .map(k => occRes[k]["pct"])
            .reduce((acc, cur) => acc + cur, 0.0)
        )
      } else {
        return acc + occRes[cur["party"]]["pct"]
      }
    }

    const ratio = positions
      .filter(p => (reverse ? p.value === -1 : p.value === 1))
      .reduce(countVotes, 0.0)
    return ratio
  }

  render() {
    let thesesElems = this.props.theses
      .sort((a, b) => (this.getRatio(a) > this.getRatio(b) ? -1 : 1))
      .map((t, i) => {
        return (
          <div key={"thesis-compact-" + i} className="thesis-compact">
            <Header size="medium">{t.title} </Header>
            <CompactThesis
              key={t.id}
              election={this.props.election}
              listIndex={i}
              iframe={this.props.iframe}
              {...t}
            />
          </div>
        )
      })

    const sourceName =
      this.props.election !== null && this.props.election.results_source.name

    const legendShowMissing =
      this.props.election !== null && parseInt(this.props.election.date) < 2008

    return (
      <div className="election-component">
        <Header as="h1" className={this.props.iframe ? "hyphenate" : ""}>
          {this.props.title != null
            ? this.props.title
            : this.props.election == null
              ? " "
              : this.props.election.preliminary
                ? "Welche Politik wird bei der " +
                  this.props.election.title +
                  " voraussichtlich gewählt?"
                : "Welche Politik wurde bei der " +
                (this.props.election.title === "Landtagswahl Hessen 2018"
                    ? "Hessenwahl"
                    : this.props.election.title) +
                  " gewählt?"}
          {this.props.election != null && (
            <Header.Subheader>
              <ElectionSubheader
                sourceName={sourceName}
                iframe={this.props.iframe}
                preliminary={this.props.election.preliminary}
                numTheses={this.props.theses.length}
              />
            </Header.Subheader>
          )}
        </Header>

        {this.props.election && (
          <Legend
            text="Legende:"
            showMissing={legendShowMissing === true}
            preliminary={this.props.election.preliminary}
          />
        )}

        {/* Main content */}
        {thesesElems.length > 0 && (
          <span>
            <div className="theses">{thesesElems}</div>
            <SourcesFooter election={this.props.election} iframe={this.props.iframe} />
          </span>
        )}
      </div>
    )
  }
}
