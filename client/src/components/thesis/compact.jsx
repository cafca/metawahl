// @flow

import "moment/locale/de"
import React, { Component } from "react"
import autoBind from "react-autobind"
import { Transition, Message, Icon } from "semantic-ui-react"

import "../../index.css"
import PositionChart from "../positionChart/"
import ErrorHandler from "../../utils/errorHandler"
import { extractThesisID } from "../../utils/thesis"

import type {
  ErrorType,
  MergedPartyDataType,
  ElectionType,
  PositionType,
  RouteProps,
  ThesisType
} from "../../types/"
import type { OpenTextType } from "./"

import "./Thesis.css"

const valueNames = {
  "-1": "dagegen",
  "0": "neutral",
  "1": "dafür"
}

type State = {
  ratioPro: number,
  ratioContra: number,
  loading: boolean,
  parties: Array<MergedPartyDataType>,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: -1 | 0 | 1,
  openText: ?OpenTextType
}

type Props = RouteProps &
  ThesisType & {
    election?: ElectionType,
    linkElection?: boolean,
    showHints?: boolean,
    quizMode?: boolean,
    listIndex?: number,
    iframe?: boolean
  }

export default class CompactThesis extends Component<Props, State> {
  handleError: ErrorType => any

  constructor(props: Props) {
    super(props)
    autoBind(this)
    this.state = {
      loading: false,
      parties: [],
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      ratioPro: 0.5,
      ratioContra: 0.5,
      openText: null
    }

    this.handleError = ErrorHandler.bind(this)
  }

  componentWillMount() {
    this.mergePartyData()
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      tags: nextProps.tags
    })

    if (
      Object.is(nextProps.election.results, this.props.election.results) ===
      false
    ) {
      this.mergePartyData()
    }
  }

  mergePartyData() {
    // Merge party positions with election results
    const res = this.props.election.results
    const sortPositions = (a, b) => {
      if (res != null) {
        // Sort last if vote count unknown
        if (res[a.party] == null) return 1
        if (res[b.party] == null) return -1

        if (res[a.party]["votes"] !== res[b.party]["votes"]) {
          return res[a.party]["votes"] > res[b.party]["votes"] ? -1 : 1
        }
      }

      // Sort by name otherwise
      return a.party > b.party ? 1 : -1
    }

    const parties = Object.keys(res).map(party => {
      const linked_position = res[party]["linked_position"] || party
      const rv = Object.assign(
        {},
        res[party],
        this.props.positions
          .filter(pos => pos.party === linked_position || pos.party === party)
          .shift() || { value: "missing" },
        { party }
      )
      return rv
    })

    let proPositions = parties.filter(p => p.value === 1).sort(sortPositions)

    let neutralPositions = parties
      .filter(p => p.value === 0)
      .sort(sortPositions)

    let contraPositions = parties
      .filter(p => p.value === -1)
      .sort(sortPositions)

    this.setState(
      { parties, proPositions, neutralPositions, contraPositions },
      this.updateVoterOpinion
    )
  }

  updateVoterOpinion() {
    const countVotes = (prev, cur) =>
      this.props.election.results[cur["party"]] == null
        ? prev
        : prev + this.props.election.results[cur["party"]]["pct"]

    let voterOpinion

    const ratioPro = this.state.proPositions.reduce(countVotes, 0.0)
    const ratioContra = this.state.contraPositions.reduce(countVotes, 0.0)

    if (ratioPro > 50.0) {
      voterOpinion = 1
    } else if (ratioContra < 50.0) {
      voterOpinion = 0
    } else {
      voterOpinion = -1
    }

    this.setState({ voterOpinion, ratioPro, ratioContra })
  }

  toggleOpen(position: ?PositionType) {
    let openText: ?OpenTextType

    if (position == null) {
      this.setState({ openText: null })
      return
    }

    if (position.party === "Sonstige") {
      openText = Object.assign({}, position, {
        text:
          "Kleine Parteien sind in den Prognosewerten nicht enthalten, da deren Wahlergebnisse kaum vorherzusehen sind."
      })
    } else if (position.value === "missing") {
      openText = Object.assign({}, position, {
        text:
          "Von dieser Partei liegen zu dieser Wahl keine Stellungnahmen vor."
      })
    } else if (position.text == null || position.text.length === 0) {
      openText = Object.assign({}, position, {
        text: "Es liegt keine Begründung zur Position dieser Partei vor."
      })
    } else {
      openText = Object.assign({}, position, {
        text: "»" + position.text + "«"
      })
    }

    const name =
      this.props.election.results[openText.party]["name"] || openText.party
    // const result =
    //   (this.props.election.results[openText.party]["pct"] || "<0,1") + "%"
    const posName =
      Object.keys(valueNames).indexOf(openText.value.toString()) > -1
        ? valueNames[openText.value]
        : ""
    // const ifPrognosis = this.props.preliminary === true ? "Wahlprognose " : ""
    openText["header"] = `${name} ${posName}:`

    this.setState({ openText })
  }

  render() {
    const proCount = this.state.proPositions
      ? this.state.proPositions.length
      : "..."

    const totalCount = this.state.proPositions
      ? this.state.proPositions.length +
        this.state.neutralPositions.length +
        this.state.contraPositions.length
      : "..."

    const tUrl = `/wahlen/${this.props.election.territory}/${
      this.props.election.id
    }/${extractThesisID(this.props.id).thesisNUM}/`
    return (
      <div>
        <PositionChart
          parties={this.state.parties}
          toggleOpen={this.toggleOpen}
          compact={true}
          preliminary={this.props.election.preliminary}
          listIndex={this.props.listIndex}
        />
        {this.state.openText === null && (
          <span className="thesisTitleInsert">
            {proCount} von {totalCount} Parteien{" "}
            {proCount === 1 ? "fordert" : "fordern"}: {this.props.text}
          </span>
        )}
        <Transition visible={this.state.openText != null}>
          <div>
            <Message
              className="positionPopup"
              attached
              onDismiss={() => this.toggleOpen(null)}
              header={this.props.text}
              content={
                <p>
                  <strong>
                    {this.state.openText != null && this.state.openText.header}
                  </strong>{" "}
                  {this.state.openText != null && this.state.openText.text}
                </p>
              }
            />
            <Message attached="bottom" info>
              <Icon name="arrow right" />
              {this.props.iframe === true ? (
                <span>
                  <a href={tUrl} style={{ textDecoration: "underline" }}>
                    Öffne diese These auf{" "}
                      Metawahl.de
                  </a>{" "}
                  und finde heraus, wie die Parteien ihre Position gegenüber
                  vergangenen Wahlen geändert haben.
                </span>
              ) : (
                <a href={tUrl} style={{ cursor: "pointer" }}>
                  <span>
                    In der{" "}
                    <span style={{ textDecoration: "underline" }}>
                      Detailansicht
                    </span>{" "}
                    zu dieser These findest du heraus, wie die Parteien ihre
                    Position gegenüber vergangenen Wahlen geändert haben.
                  </span>
                </a>
              )}
            </Message>
          </div>
        </Transition>
      </div>
    )
  }
}
