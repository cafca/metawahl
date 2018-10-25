// @flow

import React from "react"
import autoBind from "react-autobind"
import {
  Breadcrumb,
  Container,
  Header,
  Message,
  Loader
} from "semantic-ui-react"
import Moment from "moment"

import { API_ROOT, TERRITORY_NAMES } from "../../config/"
import SEO from "../../components/seo/"
import ThesisComponent from "../../components/thesis/"
import Errorhandler from "../../utils/errorHandler"
import { RouteProps, ThesisType, ElectionType } from "../../types/"
import Legend from "../../components/legend/"

import "./styles.css"

type State = {
  isLoading: boolean,
  election: ElectionType,
  thesis: ThesisType,
  related: Array<ThesisType>
}

class Thesis extends React.Component<RouteProps, State> {
  constructor(props) {
    super(props)
    autoBind(this)
    this.territory = props.match.params.territory
    this.electionNum = parseInt(props.match.params.electionNum, 10)
    this.thesisNum = parseInt(props.match.params.thesisNum, 10)

    this.state = {
      isLoading: true,
      election: this.getCachedElection(),
      thesis: null,
      related: []
    }
    this.handleError = Errorhandler.bind(this)
  }

  componentDidMount() {
    if (this.state.election == null) {
      this.loadElection(() => this.loadThesis())
    } else {
      this.loadThesis()
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
        this.handleError(response)
        this.setState({
          election: response.data
        })
        if (cb != null) cb(response.data)
      })
      .catch((error: Error) => {
        this.handleError(error)
        console.log("Error fetching election data: " + error.message)
        this.setState({
          election: this.getCachedElection()
        })
      })
  }

  loadThesis(cb?: ThesisType => mixed) {
    const endpoint =
      API_ROOT +
      "/thesis/WOM-" +
      this.electionNum.toString().padStart(3, "0") +
      "-" +
      this.thesisNum.toString().padStart(2, "0")

    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.handleError(response)
        this.setState({
          isLoading: false,
          thesis: response.data,
          related: response.related
        })
        if (cb != null) cb(response.data)
      })
      .catch((error: Error) => {
        this.handleError(error)
        console.log("Error fetching election data: " + error.message)
        this.setState({
          isLoading: false
        })
      })
  }

  getCachedElectionById(oid: string) {
    for (let terr of Object.keys(this.props.elections)) {
      for (let o of this.props.elections[terr]) {
        if (o.id === oid) {
          return o
        }
      }
    }
  }

  render() {
    const relatedElems =
      this.state.error != null || this.state.related == null
        ? []
        : this.state.related.map(t => {
            const election = this.getCachedElectionById(t.election_id)
            return election == null ? null : (
              <ThesisComponent
                key={t.id}
                election={election}
                linkElection={true}
                showHints={false}
                {...t}
              />
            )
          })

    const legendShowMissing =
      this.state.election && parseInt(this.state.election.date) < 2008

    return (
      <Container id="outerContainer">
        <SEO
          title={
            "Metawahl: " +
            (this.state.election ? this.state.election.title + " Quiz" : "Quiz")
          }
        />

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
            <span>
              <Breadcrumb.Section
                href={`/wahlen/${this.territory}/${this.electionNum}/`}
              >
                {Moment(this.state.election.date).year()}
              </Breadcrumb.Section>
              <Breadcrumb.Divider icon="right angle" />
              <Breadcrumb.Section
                active
                href={`/wahlen/${this.territory}/${this.electionNum}/${
                  this.thesisNum
                }`}
              >
                These #{this.thesisNum + 1}
              </Breadcrumb.Section>
            </span>
          )}
        </Breadcrumb>

        {this.state.error != null && (
          <Message negative content={this.state.error} />
        )}

        {this.state.thesis != null &&
          this.state.election != null && (
            <Header as="h1">
              These #{this.thesisNum + 1} aus dem Wahl-o-Mat zur{" "}
              {this.state.election.title}
            </Header>
          )}

        <Loader active={this.state.isLoading} />

        {this.state.isLoading === false &&
          this.state.error == null && (
            <div className="contentLoaded">
              <Legend
                text="Legende:"
                preliminary={
                  this.state.election && this.state.election.preliminary
                }
                genericVariation={true}
                showMissing={legendShowMissing}
              />
              <ThesisComponent
                election={this.state.election}
                linkElection={true}
                showHints={true}
                {...this.state.thesis}
              />
              <div>
                <Header size="large" id="relatedHeader">
                  Ähnliche Thesen aus dem Archiv
                </Header>
                {relatedElems.length === 0 && (
                  <p>
                    Leider hat Metawahl für diese These in keinem anderen
                    Wahl-o-Mat ähnliche Themen gefunden.
                  </p>
                )}
                {relatedElems}
              </div>
            </div>
          )}
      </Container>
    )
  }
}

export default Thesis
