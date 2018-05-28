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

    // Determine the ratio of positive votes by summing up the vote results
    // of all parties with positive answers
    const getRatio = ({ title, positions }) => {
      // Combine results if multiple parties correspond to an entry (CDU + CSU => CDU/CSU)
      // otherwise just return accumulator `acc` + result of party `cur`
      const countVotes = (acc, cur) => {
        if (occRes[cur["party"]] == null) {
          let multipleLinkedResults = Object.keys(occRes)
            .filter(k => occRes[k].linked_position === cur["party"]);
          return acc + multipleLinkedResults
            .map(k => occRes[k]['pct'])
            .reduce((acc, cur) => acc + cur, 0.0);
        } else {
          return acc + occRes[cur["party"]]["pct"];
        }
      }

      const ratioPro = positions.filter(p => p.value === 1).reduce(countVotes, 0.0);
      // const ratioContra = positions.filter(p => p.value === -1).reduce(countVotes, 0.0);
      console.log(ratioPro, title, positions)
      return ratioPro;
    }


    const thesesElems = this.state.isLoading || this.state.error ? [] : this.state.theses
    .sort((a, b) => getRatio(a) > getRatio(b) ? -1 : 1)
    .map(
      (t, i) => <div key={'thesis-line-' + i} className='thesis-line'>
        <Thesis
          key={t.id}
          occasion={this.state.occasion}
          showHints={i === 0}
          compact={true}
          {...t} />
        <span className='thesisTitleInsert'><strong>{
          getRatio(t) < 1 ? "<1" :
            getRatio(t) > 99 ? ">99" :
              Math.round(getRatio(t))} von 100 pro {t.title}:</strong> {t.text}</span>
      </div>
    );

    return <Container fluid={true} style={{minHeight: 350, padding: "1em"}} >
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
          : 'Welche Politik wurde bei der ' + this.state.occasion.title + ' gewählt?'}
          <Header.Subheader>Die Grafik zeigt, welcher Stimmanteil an Parteien
            ging, die sich im Wahl-o-Mat für eine These ausgesprochen haben.
          </Header.Subheader>
      </Header>

      <Legend />

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      <Loader active={this.state.isLoading} />

      {this.state.isLoading === false &&
      <div className="theses">
        {thesesElems}
      </div>
      }
    </Container>;
  }
}
