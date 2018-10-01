// @flow

import React from "react";
import autoBind from "react-autobind";
import { Breadcrumb, Container, Loader, Message } from "semantic-ui-react";
import Moment from "moment";

import "../../index.css";
import Errorhandler from "../../utils/errorHandler";
import { API_ROOT, TERRITORY_NAMES } from "../../config/";
import { ErrorType, RouteProps, ThesisType, OccasionType } from "../../types/";
import {
  WikidataLabel,
  WikipediaLabel
} from "../../components/label/DataLabel.jsx";
import SEO from "../../components/seo/";
import SuggestionsGrid from "../../components/suggestionsGrid";
import OccasionComponent from "../../components/occasion";

import "./styles.css";

type State = {
  isLoading: boolean,
  occasion: ?OccasionType,
  theses: Array<ThesisType>,
  error?: ?string
};

export default class Occasion extends React.Component<RouteProps, State> {
  territory: string;
  occasionNum: number;
  handleError: ErrorType => any;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.occasionNum = parseInt(this.props.match.params.occasionNum, 10);
    this.territory = this.props.match.params.territory;
    this.state = {
      isLoading: true,
      occasion: this.getCachedOccasion(),
      theses: []
    };
    this.thesisRefs = {};
    this.handleError = Errorhandler.bind(this);
  }

  componentDidMount() {
    this.loadOccasion();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    if (nextProps.match.params.occasionNum !== this.occasionNum) {
      this.occasionNum = parseInt(nextProps.match.params.occasionNum, 10);
      this.territory = nextProps.match.params.territory;
      this.setState({
        isLoading: true,
        occasion: this.getCachedOccasion(),
        theses: []
      });
      this.thesisRefs = {};
      this.loadOccasion();
    }
  }

  getCachedOccasion() {
    return this.props.occasions[this.territory] == null
      ? null
      : this.props.occasions[this.territory]
          .filter(occ => occ.id === this.occasionNum)
          .shift();
  }

  loadOccasion(cb?: OccasionType => mixed) {
    const endpoint = API_ROOT + "/occasions/" + this.occasionNum;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        if (!this.handleError(response)) {
          this.setState({
            isLoading: false,
            occasion: response.data,
            theses: response.theses || []
          });
          if (cb != null) cb(response.data);
        }
      })
      .catch((error: Error) => {
        this.handleError(error);
        console.log("Error fetching occasion data: " + error.message);
        this.setState({
          isLoading: false,
          occasion: this.getCachedOccasion(),
          theses: []
        });
      });
  }

  render() {
    // Select another occasion from the same territory for the
    // suggestion box. Fallback to this one if it's the only one
    let occ2 =
      this.props.occasions[this.territory] == null
        ? null
        : this.props.occasions[this.territory]
            .reverse()
            .filter(occ => occ.id !== this.occasionNum)
            .shift();
    if (occ2 == null) occ2 = this.state.occasion;

    let suggestions = [];
    if (occ2 != null && this.state.occasion != null) {
      suggestions = [
        {
          subTitle: "Teste dein Wissen",
          title: "Quiz zur " + this.state.occasion.title,
          href: "/quiz/" + this.territory + "/" + this.occasionNum + "/"
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
      ];
    }

    const pageTitle =
      this.state.occasion == null
        ? "Metawahl"
        : `Metawahl: ${this.state.occasion.title}`;

    return (
      <Container fluid className="occasionContainer">
        <SEO title={pageTitle} />

        <Breadcrumb>
          <Breadcrumb.Section href="/wahlen/">Wahlen</Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section href={`/wahlen/${this.territory}/`}>
            {TERRITORY_NAMES[this.territory]}
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          {this.state.occasion == null ? (
            <Breadcrumb.Section>Loading...</Breadcrumb.Section>
          ) : (
            <Breadcrumb.Section
              active
              href={`/wahlen/${this.territory}/${this.occasionNum}/`}
            >
              {Moment(this.state.occasion.date).year()}
            </Breadcrumb.Section>
          )}
        </Breadcrumb>

        <WikidataLabel
          {...this.state.occasion}
          style={{ marginRight: "-10.5px" }}
        />
        <WikipediaLabel
          {...this.state.occasion}
          style={{ marginRight: "-10.5px" }}
        />

        <OccasionComponent
          occasion={this.state.occasion}
          theses={this.state.theses}
          territory={this.territory}
          occasionNum={this.occasionNum}
        />

        {this.state.error != null && (
          <Message negative content={this.state.error} />
        )}

        <Loader active={this.state.isLoading} />

        {/* Browsing suggestions */}
        {this.state.isLoading === false && (
          <SuggestionsGrid title="Und jetzt:" sections={suggestions} />
        )}
      </Container>
    );
  }
}
