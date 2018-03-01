// @flow

import React from 'react';
import autoBind from 'react-autobind';
import { Breadcrumb, Container, Header, Loader, Message } from 'semantic-ui-react';
import Moment from 'moment';

import '../../index.css';
import Thesis from '../../components/thesis/';
import Errorhandler from '../../utils/errorHandler';
import { API_ROOT, TERRITORY_NAMES } from '../../config/';
import { ErrorType, RouteProps, ThesisType, OccasionType } from '../../types/';
import { WikidataLabel, WikipediaLabel } from '../../components/label/DataLabel.jsx'
import SEO from '../../components/seo/';
import Legend from '../../components/legend/';

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
    this.state =  {
      isLoading: true,
      occasion: this.getCachedOccasion(),
      theses: []
    }

    this.handleError = Errorhandler.bind(this);
  }

  componentDidMount() {
    this.loadOccasion();
  }

  getCachedOccasion() {
    return this.props.occasions[this.territory] == null ? null :
      this.props.occasions[this.territory]
      .filter(occ => occ.id === this.occasionNum)
      .shift();
  }

  extractThesisID(thesisID: string) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  loadOccasion(cb?: OccasionType => mixed) {
    const endpoint = API_ROOT + "/occasions/" + this.occasionNum;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.handleError(response);
        this.setState({
          isLoading: false,
          occasion: response.data,
          theses: response.theses || []
        })
        if (cb != null) cb(response.data);
      })
      .catch((error: Error) => {
        this.handleError(error);
        console.log("Error fetching occasion data: " + error.message)
        this.setState({
          isLoading: false,
          occasion: this.getCachedOccasion(),
          theses: []
        })
      })
  }

  render() {
    const occRes = this.state.occasion.results;
    const getRatio = ({ title, positions }) => {
      const countVotes = (prev, cur) =>
        occRes[cur["party"]] == null
          ? prev
          : prev + occRes[cur["party"]]["pct"];

      let voterOpinion;

      const ratioPro = positions.filter(p => p.value === 1).reduce(countVotes, 0.0);
      const ratioContra = positions.filter(p => p.value === -1).reduce(countVotes, 0.0);
      console.log(title, positions)
      return ratioPro;
    }


    const thesesElems = this.state.isLoading || this.state.error ? [] : this.state.theses
    .sort((a, b) => getRatio(a) < getRatio(b) ? -1 : 1)
    .map(
      (t, i) => <span><Thesis
        key={t.id}
        occasion={this.state.occasion}
        showHints={i === 0}
        {...t} /> {t.title}</span>
    );

    return <Container style={{minHeight: 350}} >
      <SEO title={'Metawahl: '
        + (this.state.occasion ? this.state.occasion.title : "")} />

      <Breadcrumb>
        <Breadcrumb.Section href="/wahlen/">Wahlen</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        <Breadcrumb.Section href={`/wahlen/${this.territory}/`}>
          {TERRITORY_NAMES[this.territory]}
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        { this.state.occasion == null
          ? <Breadcrumb.Section>Loading...</Breadcrumb.Section>
          : <Breadcrumb.Section active>
              {Moment(this.state.occasion.date).year()}
            </Breadcrumb.Section>
        }
      </Breadcrumb>

      <WikidataLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />
      <WikipediaLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />

      <Header as='h1'>
        { this.state.occasion == null ? " "
          : this.state.occasion.title}
      </Header>

      <Legend />

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      <Loader active={this.state.isLoading} />

      {this.state.isLoading === false &&
      <div className="theses" style={{marginTop: "2em"}}>
        {thesesElems}
      </div>
      }
    </Container>;
  }
}
