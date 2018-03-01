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
      quizMode: this.props.match.params.displayMode === "quiz" ? true : false,
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
    debugger;
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
    const endpoint = `${API_ROOT}/occasions/${this.occasionNum}`;
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
    let thesesSelection;

    if (this.state.isLoading || this.state.error) {
      thesesSelection = [];

    } else if (this.state.quizMode === true) {
      thesesSelection = this.state.theses
        .sort((a, b) => a.id > b.id ? 1 : -1)
        .slice(0, quizThesesCount);

      // Hide theses not answered, except for next question
      thesesSelection = thesesSelection
        .slice(0, this.state.quizAnswers.length + 1);

      quizResult = this.state.quizAnswers
        .map(a => a === true ? 1 : 0)
        .reduce((acc, cur) => acc + cur, 0) / this.state.quizAnswers.length;

    } else {
      thesesSelection = this.state.theses.sort((a, b) => a.id > b.id ? 1 : -1);
    }

    const thesesElems = thesesSelection
      .map(
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

    return <Container id="outerContainer" style={{minHeight: 350}} >
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
          <Breadcrumb.Section active href={`/wahlen/${this.territory}/quiz/`}>
            Quiz
          </Breadcrumb.Section>
        </span> }
      </Breadcrumb>

      <WikidataLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />
      <WikipediaLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />

      <Header as='h1'>
        { this.state.occasion == null ? " "
          : (this.state.quizMode === true ? "Teste dein Wissen: " : "")
            + this.state.occasion.title}
      </Header>

      <h3>
        Haben mehr Wähler in {TERRITORY_NAMES[this.territory]} die Parteien gewählt, die im Wahl-o-Mat für eine These waren - oder
        die Parteien, die dagegen waren?
      </h3>

      { this.state.quizMode === false &&
        <div className='quizLink'><Button size='huge' as='a'
          href={window.location + 'quiz/'} className='ellipsis'>
          <span role='img' aria-label='Pokal'>🏆</span> Teste dein Wissen im Quiz zur Wahl
        </Button></div>
      }

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      <div style={{marginTop: "3em"}}>
        <Legend />
      </div>

      <Loader active={this.state.isLoading} />

      {this.state.isLoading === false &&
      <div className="theses" style={{marginTop: "2em"}}>
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
            Es gibt einen Quiz für jede Wahl, bei der es auch einen Wahl-o-Maten gab.</p>

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
