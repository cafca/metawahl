// @flow

import React from "react"
import autoBind from "react-autobind"
import { Button, Header, Message, Icon } from "semantic-ui-react"

import CompactThesis from "../../components/thesis/compact"
import { RouteProps, ThesisType, ElectionType } from "../../types/"
import Legend from "../../components/legend/"
import { extractThesisID } from "../../utils/thesis"

import "./styles.css"

type Props = {
  territory: string,
  electionNum: number,
  election: ?ElectionType,
  theses: Array<ThesisType>
}

type State = {}

export default class Election extends React.Component<Props, State> {
  territory: string

  constructor(props: RouteProps) {
    super(props)
    autoBind(this)
    this.thesisRefs = {}
  }

  collectSources() {
    let sources = []
    if (this.props.election != null) {
      sources.push(
        <span key="wom-source">
          <a href={this.props.election.source}>
            Wahl-o-Mat zur {this.props.election.title} © Bundeszentrale für
            politische Bildung
          </a>{" "}
          via{" "}
          <a href="https://github.com/gockelhahn/qual-o-mat-data">
            qual-o-mat-data
          </a>
        </span>
      )
      if (this.props.election.results_sources) {
        this.props.election.results_sources.forEach(
          url =>
            url.indexOf("wahl.tagesschau.de") >= 0
              ? sources.push(
                  <span key="tagesschau-source">
                    ,<a href={url}>Wahlergebnisse: wahl.tagesschau.de</a>
                  </span>
                )
              : url.indexOf("wikipedia") >= 0
                ? sources.push(
                    <span key="wp-source">
                      ,
                      <a href={url}>
                        Wahlergebnisse aus Wikipedia und lizensiert unter
                        CC-BY-NC-SA-3.0
                      </a>
                    </span>
                  )
                : sources.push(
                    <span key="dawum-source">
                      ,
                      <a href={url}>
                        Wahlprognose von dawum.de und lizensiert unter
                        CC-BY-NC-SA-4.0
                      </a>
                    </span>
                  )
        )
      }
    }
    return sources
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
        const tUrl = `/wahlen/${this.props.territory}/${
          this.props.electionNum
        }/${extractThesisID(t.id).thesisNUM}/`
        const proCount = t.positions.filter(p => p.value === 1).length

        return (
          <div key={"thesis-compact-" + i} className="thesis-compact">
            <a href={tUrl}>
              <Header size="medium">{t.title} </Header>
              <CompactThesis key={t.id} election={this.props.election} {...t} />
              <span className="thesisTitleInsert">
                {proCount} von {t.positions.length} Parteien fordern: {t.text}
              </span>
            </a>
          </div>
        )
      })

    let sources = this.collectSources()

    const quizUrl = `/quiz/${this.props.territory}/${this.props.electionNum}/`

    return (
      <div className="election-component">
        <Header as="h1">
          {this.props.title != null
            ? this.props.title
            : this.props.election == null
              ? " "
              : this.props.election.preliminary
                ? "Welche Politik wird voraussichtlich bei der " +
                  this.props.election.title +
                  " gewählt?"
                : "Welche Politik wurde bei der " +
                  this.props.election.title +
                  " gewählt?"}
          {this.props.election != null && (
            <Header.Subheader>
              {this.props.election.preliminary
                ? "Hier wird gezeigt, welcher Stimmanteil laut Wahlprognosen an Parteien geht, die sich im Wahl-o-Mat für die jeweiligen Thesen ausgesprochen haben"
                : "Hier wird gezeigt, welcher Stimmanteil an Parteien ging, die sich vor der Wahl für eine These ausgesprochen haben."}
            </Header.Subheader>
          )}
        </Header>

        <Button

          compact
          icon
          labelPosition="left"
          floated="right"
          as="a"
          href={quizUrl}
        >
          <Icon name="right arrow" />
          Teste dein Wissen im Quiz
        </Button>

        <Legend text="Partei ist:" />

        {/* Main content */}
        {thesesElems.length > 0 && (
          <span>
            <div className="theses">{thesesElems}</div>
            <p className="sources">Quellen: {sources}</p>
          </span>
        )}
      </div>
    )
  }
}
