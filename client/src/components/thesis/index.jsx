// @flow

import "moment/locale/de"
import React, { Component } from "react"
import autoBind from "react-autobind"
import {
  Button,
  Header,
  Icon,
  Loader,
  Message,
  Segment
} from "semantic-ui-react"

import "../../index.css"
import WikidataTagger from "../wikidataTagger/"
import Tag from "../tag/"
import PositionChart from "../positionChart/"
import Map from "../map/"
import ErrorHandler from "../../utils/errorHandler"
import { extractThesisID } from "../../utils/thesis"

import {
  adminKey,
  API_ROOT,
  COLOR_PALETTE,
  OPINION_COLORS,
  IS_ADMIN,
  makeJSONRequest
} from "../../config/"

import type {
  ErrorType,
  MergedPartyDataType,
  ElectionType,
  PositionType,
  RouteProps,
  TagType,
  ThesisType
} from "../../types/"

import type { WikidataType } from "../wikidataTagger/"

import "./Thesis.css"

const ElectionSubtitle = ({ election }: { election?: ElectionType }) =>
  election != null && (
    <span>
      <Map
        territory={election.territory}
        inverted={true}
        style={{ height: "3em", float: "right", paddingLeft: ".5em" }}
      />{" "}
      <p
        style={{
          fontVariant: "all-small-caps",
          marginBottom: ".3rem",
          lineHeight: "1em",
          color: "rgba(255,255,255,.8)"
        }}
      >
        {election.title}
      </p>
    </span>
  )

const valueNames = {
  "-1": "Dagegen",
  "0": "Neutral",
  "1": "Dafür"
}

export type OpenTextType = PositionType & {
  header?: string
}

type State = {
  ratioPro: number,
  ratioContra: number,
  openText: ?OpenTextType,
  tags: Array<TagType>,
  loading: boolean,
  parties: Array<MergedPartyDataType>,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: -1 | 0 | 1,
  showSources: boolean,
  quizAnswer: ?number
}

type Props = RouteProps &
  ThesisType & {
    election?: ElectionType,
    linkElection?: boolean,
    showHints?: boolean,
    quizMode?: boolean,
    hideTags?: boolean
  }

export default class Thesis extends Component<Props, State> {
  handleError: ErrorType => any

  constructor(props: Props) {
    super(props)
    autoBind(this)
    this.state = {
      openText: null,
      tags: this.props.tags,
      loading: false,
      parties: [],
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      ratioPro: 0.5,
      ratioContra: 0.5,
      showSources: false,
      quizAnswer: null
    }

    this.handleError = ErrorHandler.bind(this)
  }

  collectSources() {
    let sources = []
    if (this.props.election != null) {
      sources.push(
        <span key="wom-source">
          <a href={this.props.election.source}>
            Wahl-o-Mat zur {this.props.election.title} der Bundeszentrale für
            politische Bildung
          </a>{" "}
          via{" "}
          <a href="https://github.com/gockelhahn/qual-o-mat-data">
            qual-o-mat-data
          </a>
        </span>
      )
      let source_name = this.props.election.results_source.name
      let source_url = this.props.election.results_source.url
      if (source_name == null) {
        if (source_url.indexOf("wahl.tagesschau.de") >= 0) {
          source_name = "Wahlergebnisse: wahl.tagesschau.de"
        } else if (source_url.indexOf("wikipedia") >= 0) {
          source_name =
            "Wahlergebnisse: Wikipedia und lizensiert unter CC-BY-NC-SA-3.0"
        } else if (source_url.indexOf("dawum.de") >= 0) {
          source_name =
            "Wahlprognose von dawum.de und lizensiert unter CC-BY-NC-SA-4.0"
        } else {
          source_name = source_url
        }
      }

      sources.push(
        <span key="results-source">
          ,<a href={source_url}>{source_name}</a>
        </span>
      )
    }
    return sources
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

  handleTag(tagData: WikidataType) {
    if (this.state.tags.filter(t => t.id === tagData.id).length !== 0) return

    const tag: TagType = {
      title: tagData.label,
      description: tagData.description,
      url: tagData.concepturi,
      wikidata_id: tagData.id
    }

    if (tagData.wikipedia_title != null) {
      tag.wikipedia_title = tagData.wikipedia_title
    }
    if (tagData.labels != null) tag.labels = tagData.labels
    if (tagData.aliases != null) tag.aliases = tagData.aliases

    this.sendTagChanges({
      add: [tag],
      remove: []
    })
  }

  handleTagRemove(title: string) {
    this.sendTagChanges({
      add: [],
      remove: [title]
    })
  }

  handleAnswer(quizAnswer: -1 | 0 | 1) {
    this.setState({ quizAnswer })
    this.props.answer(quizAnswer, this.state.voterOpinion)
  }

  toggleOpen(position: PositionType) {

    let openText: OpenTextType
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
    const result =
      (this.props.election.results[openText.party]["pct"] || "<0,1") + "%"
    const posName =
      Object.keys(valueNames).indexOf(openText.value.toString()) > -1
        ? ": " + valueNames[openText.value]
        : ""
    openText["header"] = `${name} — ${result}${posName}`

    this.setState({ openText })
  }

  sendTagChanges(data: {
    remove: ?Array<string>,
    add: ?Array<TagType>,
    admin_key?: ?string
  }) {
    this.setState({ loading: true })

    const endpoint = `${API_ROOT}/thesis/${this.props.id}/tags/`
    data["admin_key"] = adminKey()
    const params = makeJSONRequest(data)

    fetch(endpoint, params)
      .then(response => response.json())
      .then(response => {
        this.setState({
          loading: false,
          tags: response.data.tags
        })
      })
      .catch((error: Error) =>
        console.log("Error changing tag: " + error.message)
      )
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

  render() {
    const tagElems = this.state.tags
      .sort((t1, t2) => (t1.slug > t2.slug ? 1 : -1))
      .map(tag => (
        <Tag
          data={tag}
          key={"Tag-" + tag.title}
          remove={this.handleTagRemove}
        />
      ))
    let voterOpinionColor

    if (this.state.voterOpinion === 0) {
      voterOpinionColor = COLOR_PALETTE[1]
    } else {
      voterOpinionColor =
        this.state.voterOpinion === -1 ? COLOR_PALETTE[0] : COLOR_PALETTE[2]
    }

    // Collect sources
    let sources = this.collectSources()

    const headerStyle =
      this.props.quizMode !== true || this.state.quizAnswer != null
        ? {
            backgroundColor: voterOpinionColor,
            minHeight: this.props.linkElection ? "4em" : null,
            fontSize: "1.7rem"
          }
        : {
            fontSize: "1.7rem",
            backgroundColor: "#333",
            color: "#fcfcfc"
          }

    const margin = this.props.quizMode ? "2em" : "2em"

    let subHeader = ""
    if (this.state.voterOpinion === 0) {
      subHeader = " Keine Mehrheit dafür oder dagegen"
    } else if (this.state.voterOpinion === 1) {
      subHeader = Math.round(this.state.ratioPro).toString()
      subHeader += this.props.election.preliminary
        ? " von 100 werden voraussichtlich Parteien wählen, die dafür sind"
        : " von 100 haben Parteien gewählt, die dafür waren"
    } else {
      subHeader = Math.round(this.state.ratioContra).toString()
      subHeader += this.props.election.preliminary
        ? " von 100 werden voraussichtlich Parteien wählen, die dagegen sind"
        : " von 100 haben Parteien gewählt, die dagegen waren"
    }

    const thesisIdComps = extractThesisID(this.props.id)
    const permaLink = `/wahlen/${this.props.election.territory}/${
      thesisIdComps["womID"]
    }/${thesisIdComps["thesisNUM"]}/`

    return (
      <div style={{ marginBottom: margin }}>
        <a href={permaLink}>
          <Header
            as="h2"
            inverted
            attached="top"
            size="huge"
            style={headerStyle}
          >
            {this.props.linkElection && (
              <ElectionSubtitle election={this.props.election} />
            )}

            {this.props.text}

            <Header.Subheader style={{ marginTop: "0.3em" }}>
              {(this.props.quizMode !== true ||
                this.state.quizAnswer != null) && <span>{subHeader}</span>}
            </Header.Subheader>
          </Header>
        </a>

        {(this.props.quizMode !== true || this.state.quizAnswer != null) && (
          <span>
            <Segment
              id={this.props.id}
              attached
              style={{ paddingBottom: "1.5em" }}
            >
              <Header sub style={{ color: "rgba(0,0,0,.65)" }}>
                Stimmverteilung{" "}
                {this.props.election.preliminary
                  ? " (Prognose)"
                  : ""}
              </Header>

              <PositionChart
                parties={this.state.parties}
                toggleOpen={this.toggleOpen}
              />

              {this.state.openText != null && (
                <Message
                  content={this.state.openText.text}
                  floating
                  header={this.state.openText.header}
                />
              )}

              {this.props.showHints === true &&
                this.state.openText == null && (
                  <Message style={{ marginTop: "1rem" }}>
                    <Icon name="hand point right outline" /> Bewege deine Maus
                    über die Parteinamen, um deren Position zu dieser These zu
                    lesen.
                  </Message>
                )}

              {this.state.error != null && (
                <Message negative content={this.state.error} />
              )}

              <p
                className="sources"
                onClick={() => this.setState({ showSources: true })}
              >
                Quellen
                {this.state.showSources && <span>: {sources}</span>}
              </p>
            </Segment>

            {this.props.hideTags !== true && (
              <Segment attached={IS_ADMIN ? true : "bottom"} secondary>
                {this.props.showHints === true &&
                <Header size="small">Alle Parteipositionen zu:</Header>
              }
                {tagElems}
                <br />
                {tagElems.length === 0 &&
                  IS_ADMIN &&
                  " Noch keine Tags gewählt. "}
              </Segment>
            )}

            {IS_ADMIN && (
              <Segment attached="bottom" secondary style={{minHeight: 70}}>
                <WikidataTagger
                  onSelection={this.handleTag}
                  style={{ float: "right" }}
                />
                {this.state.loading && <Loader />}
              </Segment>
            )}
          </span>
        )}

        {this.props.quizMode === true &&
          this.state.quizAnswer == null && (
            <Button.Group
              fluid
              className="stackable quizButtons"
              attached="bottom"
            >
              <Button
                onClick={() => this.handleAnswer(1)}
                style={{ backgroundColor: OPINION_COLORS[1] }}
              >
                Mehrheit stimmt dafür
              </Button>

              <Button
                onClick={() => this.handleAnswer(-1)}
                style={{ backgroundColor: OPINION_COLORS[-1] }}
              >
                Mehrheit stimmt dagegen
              </Button>
            </Button.Group>
          )}
      </div>
    )
  }
}
