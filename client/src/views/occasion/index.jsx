// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import autoBind from 'react-autobind';
import {
  Button, Breadcrumb, Container, Header, Loader, Message, Progress, Segment, Icon
} from 'semantic-ui-react';
import Moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import '../../index.css';
import Thesis from '../../components/thesis/';
import Errorhandler from '../../utils/errorHandler';
import { API_ROOT, SITE_ROOT, TERRITORY_NAMES } from '../../config/';
import { ErrorType, RouteProps, ThesisType, OccasionType } from '../../types/';
import { WikidataLabel, WikipediaLabel } from '../../components/label/DataLabel.jsx'
import SEO from '../../components/seo/';
import Legend from '../../components/legend/';

import './Occasion.css';

const quizThesesCount = 20; // cutoff to limit quiz length

type State = {
  isLoading: boolean,
  occasion: ?OccasionType,
  theses: Array<ThesisType>,
  quizMode: boolean,
  quizAnswers: ?Array<number>,
  linkCopied: boolean,
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
      theses: [],
      quizMode: this.props.displayMode === "quiz" ? true : false,
      quizAnswers: [],
      linkCopied: false
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
        theses: [],
        quizMode: nextProps.match.params.displayMode === "quiz" ? true : false,
        quizAnswers: []
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

  handleQuizAnswer(thesisNum, answer, correct) {
    const answerNode = ReactDOM.findDOMNode(this.thesisRefs[thesisNum]);
    window.scrollTo(0, answerNode.offsetTop - 35);
    this.setState({quizAnswers: this.state.quizAnswers.concat([correct])});
  }

  scrollToNextQuestion() {
    if (this.state.quizAnswers.length !== quizThesesCount) {
      const answerNode = ReactDOM.findDOMNode(this.thesisRefs[this.state.quizAnswers.length]);
      window.scrollTo(0, answerNode.offsetTop - 35);
    }
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
    let quizResult;
    let thesesElems;

    const occRes = this.state.occasion.results;

    // Determine the ratio of positive votes by summing up the vote results
    // of all parties with positive answers
    const getRatio = ({ title, positions }, reverse=false) => {
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

    if (this.state.isLoading || this.state.error) {
      thesesElems = [];

    } else if (this.state.quizMode === true) {
      let thesesSelection = this.state.theses
        .sort((a, b) => a.id > b.id ? 1 : -1)
        .filter(thesis => {
          const ratioPro = getRatio(thesis)
          const ratioCon = getRatio(thesis, true)
          const rv = ratioPro > 10 && ratioCon > 10 && (ratioPro > 50 || ratioCon >= 50)
          return rv
        })
        .slice(0, quizThesesCount);

      console.log('total', thesesSelection.length)

      // Hide theses not answered, except for next question
      thesesSelection = thesesSelection
        .slice(0, this.state.quizAnswers.length + 1);

      thesesElems = thesesSelection.map(
          (t, i) => <Thesis
            key={t.id}
            occasion={this.state.occasion}
            showHints={i === 0}
            quizMode={this.state.quizMode}
            scrollToNextQuestion={this.scrollToNextQuestion}
            answer={(answer, correct) => this.handleQuizAnswer(i, answer, correct)}
            ref={ref => this.thesisRefs[i] = ref}
            {...t} />
        );

      quizResult = this.state.quizAnswers
        .map(a => a === true ? 1 : 0)
        .reduce((acc, cur) => acc + cur, 0) / this.state.quizAnswers.length;

    } else {
      thesesElems = this.state.error != null ? [] : this.state.theses
      .sort((a, b) => getRatio(a) > getRatio(b) ? -1 : 1)
      .map((t, i) => {
        const tRatio = getRatio(t);
        return <div key={'thesis-compact-' + i} className='thesis-compact'>
          <Thesis
            key={t.id}
            occasion={this.state.occasion}
            compact={true}
            {...t} />
          <span className='thesisTitleInsert'>
            <strong>
              {tRatio < 1 ? "<1" : tRatio > 99 ? ">99" : Math.round(tRatio)}
              &nbsp;von 100 wählen {t.title}:
            </strong>
            &nbsp;{t.text}
          </span>
        </div>
      });
      debugger;
    }


    return <Container fluid={this.props.displayMode !== 'quiz'} style={{minHeight: 350, padding: "1em"}} >
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
          : <Breadcrumb.Section active={this.state.quizMode !== true}
              href={this.state.quizMode === true && `/wahlen/${this.territory}/${this.occasionNum}/`}>
              {Moment(this.state.occasion.date).year()}
            </Breadcrumb.Section>
        }

        { this.state.quizMode === true && <span>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active href={`/quiz/${this.territory}/${this.occasionNum}/`}>
            Quiz
          </Breadcrumb.Section>
        </span> }
      </Breadcrumb>

      <WikidataLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />
      <WikipediaLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />

      <Header as='h1'>
        { this.state.occasion == null ? " "
          : this.state.quizMode === true
            ? "Teste dein Wissen: " + this.state.occasion.title
            : 'Welche Politik wurde bei der ' + this.state.occasion.title + ' gewählt?'}
          { this.props.displayMode != 'quiz' &&
            <Header.Subheader>Die Grafik zeigt, welcher Stimmanteil an Parteien
              ging, die sich im Wahl-o-Mat für eine These ausgesprochen haben.
            </Header.Subheader>
          }
      </Header>

      { this.props.displayMode === 'quiz' &&
        <h3 style={{marginBottom: '4rem'}}>
          Was hat die Mehrheit in {TERRITORY_NAMES[this.territory]} gewählt?
        </h3>
      }

      {/* { this.state.isLoading === false && this.state.quizMode === false &&
        <div className='quizLink'><Button size='huge' as='a'
          href={'/quiz/' + this.state.occasion.territory + '/' + this.state.occasion.id + '/'} className='ellipsis'>
          <span role='img' aria-label='Pokal'>🏆</span> Teste dein Wissen im Quiz zur Wahl
        </Button></div>
      } */}

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      { this.props.displayMode != 'quiz' &&
          <Legend text='Partei war im Wahl-o-Mat:' />
      }

      <Loader active={this.state.isLoading} />

      {this.state.isLoading === false &&
      <div className="theses">
        {thesesElems}
      </div>
      }

      { this.state.quizMode === true && this.state.quizAnswers.length < this.state.theses.length &&
        <p>
          { this.state.quizAnswers.length !== quizThesesCount &&
            <span>Noch { quizThesesCount - this.state.quizAnswers.length } Thesen bis zum Ergebnis</span>
          }
          <Progress value={this.state.quizAnswers.length} total={quizThesesCount} success={this.state.quizAnswers.length === quizThesesCount && quizResult >= 0.5} />
        </p>
      }

      { this.state.quizMode === true && this.state.quizAnswers.length === quizThesesCount &&
        <Segment size='large' raised className='quizResult'>
          <Header as='h1'>
            { quizResult >= 0.5 &&
              <span>Du bist ein Gewinner! {parseInt(quizResult * 100, 10)} % der Fragen richtig.</span>
            }
            { quizResult < 0.5 &&
              <span>Leider verloren. {parseInt(quizResult * 100, 10)} % der Fragen richtig.</span>
            }
          </Header>

          <p>
            Es gibt Quizze für Deutschland, die Europawahl und alle Bundesländer in denen es Wahl-o-Maten gab.</p>

          <p>
            <Link to='/wahlen/'><Icon name='caret right' /> Auf zum nächsten Quiz!</Link> <br />
            <Link to='/'><Icon name='caret right' /> Finde heraus, worum es bei Metawahl geht</Link>
          </p>


          <Button.Group className='stackable'>
          <Button as='a' href={'https://www.facebook.com/sharer/sharer.php?u=' + SITE_ROOT + this.props.location.pathname}
             className='item' color='facebook'>Quiz auf Facebook teilen</Button>
          <Button as='a' href={'https://twitter.com/home?status=' + SITE_ROOT + this.props.location.pathname}
             className='item' color='twitter'>Quiz auf Twitter teilen</Button>
          <CopyToClipboard text={SITE_ROOT + this.props.location.pathname}
            onCopy={() => this.setState({linkCopied: true})}>
            <Button onClick={this.onClick}><Icon name={this.state.linkCopied ? 'check' : 'linkify'} /> Link kopieren</Button>
          </CopyToClipboard>
          </Button.Group>
        </Segment>
      }
    </Container>;
  }
}
