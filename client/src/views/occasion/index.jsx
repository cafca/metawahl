// @flow

import React from 'react';
import autoBind from 'react-autobind';
import {
  Breadcrumb, Container, Header, Loader, Message
} from 'semantic-ui-react';
import Moment from 'moment';

import '../../index.css';
import Thesis from '../../components/thesis/';
import Errorhandler from '../../utils/errorHandler';
import { API_ROOT, TERRITORY_NAMES } from '../../config/';
import { ErrorType, RouteProps, ThesisType, OccasionType } from '../../types/';
import { WikidataLabel, WikipediaLabel } from '../../components/label/DataLabel.jsx'
import SEO from '../../components/seo/';
import SuggestionsGrid from '../../components/suggestionsGrid';
import Legend from '../../components/legend/';
import { extractThesisID } from '../../utils/thesis';

import './styles.css';

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
    this.thesisRefs = {};
    this.handleError = Errorhandler.bind(this);
  }

  componentDidMount() {
    this.loadOccasion();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    if(nextProps.match.params.occasionNum !== this.occasionNum) {
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
    return this.props.occasions[this.territory] == null ? null :
      this.props.occasions[this.territory]
      .filter(occ => occ.id === this.occasionNum)
      .shift();
  }

  getRatio({ title, positions }, reverse=false) {
    // Determine the ratio of positive votes by summing up the vote results
    // of all parties with positive answers
    if (this.state.occasion === null) return null

    const occRes = this.state.occasion.results;

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

    const ratio = positions.filter(p => reverse ? p.value === -1 : p.value === 1).reduce(countVotes, 0.0);
    return ratio;
  }

  loadOccasion(cb?: OccasionType => mixed) {
    const endpoint = API_ROOT + "/occasions/" + this.occasionNum;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        if (!this.handleError(response)) {
          this.setState({
            isLoading: this.state.quizMode === true,
            occasion: response.data,
            theses: response.theses || []
          })
          if (cb != null) cb(response.data);
        }
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
    let thesesElems;

    if (this.state.isLoading || this.state.error) {
      thesesElems = [];

    } else {
      thesesElems = this.state.error != null ? [] : this.state.theses
      .sort((a, b) => this.getRatio(a) > this.getRatio(b) ? -1 : 1)
      .map((t, i) => {
        const tRatio = this.getRatio(t);
        const tUrl = '/wahlen/'
          + this.territory + '/'
          + this.occasionNum + '/'
          + extractThesisID(t.id).thesisNUM + '/'

      return <div key={'thesis-compact-' + i} className='thesis-compact'>
        <a href={tUrl}>
          <Thesis
            key={t.id}
            occasion={this.state.occasion}
            compact={true}
            {...t} />
          <span className='thesisTitleInsert'>
            <strong>
              {tRatio < 1 ? "<1" : tRatio > 99 ? ">99" : Math.round(tRatio)}
              &nbsp;von 100 wählen <em>{t.title}</em>:
            </strong>
            &nbsp;{t.text}
          </span>
        </a>
      </div>
      });
    }

    // Select another occasion from the same territory for the
    // suggestion box. Fallback to this one if it's the only one
    let occ2 = this.props.occasions[this.territory] == null
      ? null
      : this.props.occasions[this.territory].reverse()
        .filter(occ => occ.id !== this.occasionNum)
        .shift();
    if (occ2 == null) occ2 = this.state.occasion

    let suggestions = []
    if (occ2 != null && this.state.occasion != null) {
      suggestions = [
        {
          subTitle: 'Teste dein Wissen',
          title: 'Quiz zur ' + this.state.occasion.title,
          href: '/quiz/' + this.territory + '/' + this.occasionNum + '/'
        },
        {
          subTitle: 'Welche Politik wurde gewählt',
          title: occ2.title,
          href: '/wahlen/' + this.territory + '/' + occ2.id + '/'
        },
        {
          subTitle: 'Alle Wahlen in',
          title: TERRITORY_NAMES[this.territory],
          href: '/wahlen/' + this.territory + '/'
        },
        {
          subTitle: 'Stöbere in',
          title: '600+ Wahlkampfthemen',
          href: '/themen/'
        }
      ]
    }

    return <Container fluid className='occasionContainer'>
      <SEO title={'Metawahl: '
        + (this.state.occasion ? this.state.occasion.title + ' Quiz' : "Quiz")} />

      <Breadcrumb>
        <Breadcrumb.Section href="/wahlen/">Wahlen</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        <Breadcrumb.Section href={`/wahlen/${this.territory}/`}>
          {TERRITORY_NAMES[this.territory]}
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        { this.state.occasion == null
          ? <Breadcrumb.Section>Loading...</Breadcrumb.Section>
          : <Breadcrumb.Section active
              href={`/wahlen/${this.territory}/${this.occasionNum}/`}>
              {Moment(this.state.occasion.date).year()}
            </Breadcrumb.Section>
        }
      </Breadcrumb>

      <WikidataLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />
      <WikipediaLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />

      <Header as='h1'>
        { this.state.occasion == null ? " "
          : this.state.occasion.preliminary
            ? 'Welche Politik wird voraussichtlich bei der ' + this.state.occasion.title + ' gewählt?'
            : 'Welche Politik wurde bei der ' + this.state.occasion.title + ' gewählt?'}
          { this.state.occasion != null &&
            <Header.Subheader>
              { this.state.occasion.preliminary
              ? "Die Grafik zeigt, welcher Stimmanteil laut Wahlprognosen an Parteien geht, die sich für die jeweiligen Thesen ausgesprochen haben"
              : "Die Grafik zeigt, welcher Stimmanteil an Parteien ging, die sich vor der Wahl für eine These ausgesprochen haben."
              }
            </Header.Subheader>
          }
      </Header>

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      <Legend text='Partei war im Wahl-o-Mat:' />

      <Loader active={this.state.isLoading} />

      {/* Main content */}
      {this.state.isLoading === false &&
      <div className="theses">
        {thesesElems}
      </div>
      }

      {/* Browsing suggestions */}
      { this.state.isLoading === false &&
        <SuggestionsGrid title='Und jetzt:' sections={suggestions} />
      }
    </Container>;
  }
}
