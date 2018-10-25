// @flow

import React from "react"
import autoBind from "react-autobind"
import { Breadcrumb, Container, Loader, Message } from "semantic-ui-react"
import Moment from "moment"

import "../../index.css"
import Errorhandler from "../../utils/errorHandler"
import { API_ROOT, TERRITORY_NAMES } from "../../config/"
import { ErrorType, RouteProps, ThesisType, ElectionType } from "../../types/"
import { WikidataLabel } from "../../components/label/DataLabel.jsx"
import SEO from "../../components/seo/"
import SuggestionsGrid from "../../components/suggestionsGrid"
import ElectionComponent from "../../components/election"

import "./styles.css"

type State = {
  isLoading: boolean,
  election: ?ElectionType,
  theses: Array<ThesisType>,
  error?: ?string
}

type Props = RouteProps & {
  iframe?: boolean
}

export default class Election extends React.Component<Props, State> {
  territory: string
  electionNum: number
  handleError: ErrorType => any

  constructor(props: RouteProps) {
    super(props)
    autoBind(this)
    this.electionNum = parseInt(this.props.match.params.electionNum, 10)
    this.territory = this.props.match.params.territory
    this.state = {
      isLoading: true,
      election: this.getCachedElection(),
      theses: []
    }
    this.handleError = Errorhandler.bind(this)
  }

  componentDidMount() {
    this.loadElection()
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    if (nextProps.match.params.electionNum !== this.electionNum) {
      this.electionNum = parseInt(nextProps.match.params.electionNum, 10)
      this.territory = nextProps.match.params.territory
      this.setState({
        isLoading: true,
        election: this.getCachedElection(),
        theses: []
      })
      this.loadElection()
    }
  }

  getCachedElection() {
    return this.props.elections[this.territory] == null
      ? null
      : this.props.elections[this.territory]
          .filter(occ => occ.id === this.electionNum)
          .shift()
  }

  loadElection(cb?: ElectionType => mixed) {
    const endpoint = API_ROOT + "/elections/" + this.electionNum
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        if (!this.handleError(response)) {
          this.setState({
            isLoading: false,
            election: response.data,
            theses: response.theses || []
          })
          if (cb != null) cb(response.data)
        }
      })
      .catch((error: Error) => {
        this.handleError(error)
        console.log("Error fetching election data: " + error.message)
        this.setState({
          isLoading: false,
          election: this.getCachedElection(),
          theses: []
        })
      })
  }

  render() {
    // Select another election from the same territory for the
    // suggestion box. Fallback to this one if it's the only one
    let occ2 =
      this.props.elections[this.territory] == null
        ? null
        : this.props.elections[this.territory]
            .reverse()
            .filter(occ => occ.id !== this.electionNum)
            .shift()
    if (occ2 == null) occ2 = this.state.election

    let suggestions = []
    if (occ2 != null && this.state.election != null) {
      suggestions = [
        {
          subTitle: "Teste dein Wissen",
          title: "Quiz zur " + this.state.election.title,
          href: "/quiz/" + this.territory + "/" + this.electionNum + "/"
        },
        {
          subTitle: "Welche Politik wurde gewählt",
          title: occ2.title,
          href: "/wahlen/" + this.territory + "/" + occ2.id + "/"
        },
        {
          subTitle: "Alle Wahlen in",
          title: TERRITORY_NAMES[this.territory],
          href: "/wahlen/" + this.territory + "/"
        },
        {
          subTitle: "Stöbere in",
          title: "600+ Wahlkampfthemen",
          href: "/themen/"
        }
      ]
    }

    const pageTitle =
      this.state.election == null
        ? "Metawahl"
        : `Metawahl: ${this.state.election.title}`

    const containerClass = this.props.iframe
      ? "electionContainer iframe"
      : "electionContainer"

    return (
      <Container className={containerClass}>
        {this.props.iframe !== true && (
          <div>
            <SEO title={pageTitle} />

            <Breadcrumb>
              <Breadcrumb.Section href="/wahlen/">Wahlen</Breadcrumb.Section>
              <Breadcrumb.Divider icon="right angle" />
              <Breadcrumb.Section href={`/wahlen/${this.territory}/`}>
                {TERRITORY_NAMES[this.territory]}
              </Breadcrumb.Section>
              <Breadcrumb.Divider icon="right angle" />
              {this.state.election == null ? (
                <Breadcrumb.Section>Loading...</Breadcrumb.Section>
              ) : (
                <Breadcrumb.Section
                  active
                  href={`/wahlen/${this.territory}/${this.electionNum}/`}
                >
                  {Moment(this.state.election.date).year()}
                </Breadcrumb.Section>
              )}
            </Breadcrumb>

            <WikidataLabel
              {...this.state.election}
              style={{ marginRight: "-10.5px" }}
            />
          </div>
        )}

        <ElectionComponent
          election={this.state.election}
          theses={this.state.theses}
          territory={this.territory}
          electionNum={this.electionNum}
          iframe={this.props.iframe}
        />

        {this.state.error != null && (
          <Message negative content={this.state.error} />
        )}

        <Loader active={this.state.isLoading} />

        {/* Browsing suggestions */}
        {this.state.isLoading === false &&
          this.props.iframe !== true &&
          suggestions.length > 0 && (
            <SuggestionsGrid title="Und jetzt:" sections={suggestions} />
          )}
      </Container>
    )
  }
}
