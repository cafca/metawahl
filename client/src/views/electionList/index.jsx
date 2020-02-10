// @flow

import React, { Component } from "react"
import autoBind from "react-autobind"
import moment from "moment"

import "../../index.css"
import { Link } from "react-router-dom"
import { Container, Grid, Header, List } from "semantic-ui-react"

import { TERRITORY_NAMES } from "../../config/"
import { ElectionListType, RouteProps } from "../../types/"
import MapComponent from "../../components/map/"
import SEO from "../../components/seo/"

import "./styles.css"

moment.locale("de")

type State = {
  elections: ElectionListType
}

export default class ElectionList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props)
    autoBind(this)
    this.state = {
      elections: this.props.elections
    }
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    this.setState({
      elections: nextProps.elections
    })
  }

  render() {
    let electionCount = 0

    const electionElem = territory => {
      const elections =
        this.state.elections[territory] != null &&
        this.state.elections[territory]
          .sort((a, b) => a.date < b.date ? 1 : -1)
          .map(election => {
            electionCount += 1
            return (
              <List.Item
                key={election.id}
                as="a"
                href={`/wahlen/${election.territory}/${election.id}/`}
                className="electionListItem"
              >
                <List.Header as="h3">
                  {moment(election.date).year()}
                </List.Header>
                <span>
                  {election.title.slice(0, election.title.indexOf(" "))} vom{" "}
                  {moment(election.date).format("LL")}
                </span>
              </List.Item>
            )
          })

      return (
        <Grid.Column key={territory} className="territory">
          <MapComponent territory={territory} className="map" />
          <Header dividing as="h1">
            <Link to={"/wahlen/" + territory + "/"}>
              {TERRITORY_NAMES[territory]}
            </Link>
          </Header>
          <List relaxed>{elections}</List>
        </Grid.Column>
      )
    }

    // Sort German and European elections first
    const electionElems = []
    if (this.state.elections != null) {
      electionElems.push(electionElem("deutschland"))
      electionElems.push(electionElem("europa"))
      Object.keys(this.state.elections)
        .filter(o => o !== "deutschland" && o !== "europa")
        .forEach(o => electionElems.push(electionElem(o)))
    }

    return (
      <Container>
        <SEO title="Metawahl: Alle Wahlen im Überblick" />
        <Grid stackable columns={2} padded relaxed className="electionList">
          <Grid.Row>
            <Grid.Column width={4} className="headerCount2">
              <div className="headerCountInner">
                <div>{electionCount > 0 ? electionCount : 50}</div> Wahlen
              </div>
            </Grid.Column>
            <Grid.Column width={12}>
              <h3>Bundestags-, Landtags- und Europawahlen in der Übersicht</h3>
              <p>
                Diese Übersicht zeigt alle Wahlen, zu denen ein Wahl-o-Mat
                herausgegeben wurde. Das sind leider nicht alle Wahlen, seitdem
                dieses Tool für die Bundestagswahl 2002 das erste Mal produziert
                wurde. Zu Wahlen in Mecklenburg-Vorpommern und Thüringen gab es
                noch gar keine Ausgabe und auch einzelne andere Wahlen, wie die
                Landtagswahl in Niedersachsen 2017, sind hier nicht vertreten.
              </p>
            </Grid.Column>
          </Grid.Row>
          {electionElems}
        </Grid>
      </Container>
    )
  }
}
