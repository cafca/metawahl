// @flow

import React from "react"
import { Link } from "react-router-dom"
import autoBind from "react-autobind"
import {
  Button,
  Breadcrumb,
  Container,
  Grid,
  Header,
  Loader,
  Message,
  Progress,
  Segment,
  Transition,
  Icon
} from "semantic-ui-react"
import Moment from "moment"
import { CopyToClipboard } from "react-copy-to-clipboard"

import { loadFromCache } from "../../app/"
import Thesis from "../../components/thesis/"
import Legend from "../../components/legend"
import SourcesFooter from "../../components/sourcesFooter"
import Errorhandler from "../../utils/errorHandler"
import { extractThesisID } from "../../utils/thesis"
import {
  API_ROOT,
  SITE_ROOT,
  TERRITORY_NAMES,
  makeJSONRequest
} from "../../config/"
import { ErrorType, RouteProps, ThesisType, ElectionType } from "../../types/"
import SEO from "../../components/seo/"

import "../../index.css"
import "./styles.css"

type QuizAnswer = -1 | 0 | 1
type QuizTally = { [string]: [number, number] }

type State = {
  isLoading: boolean,
  election: ?ElectionType,
  theses: Array<ThesisType>,
  quizSelection: Array<ThesisType>,
  quizAnswers: Array<boolean>,
  quizIndex: number,
  quizTally?: QuizTally,
  correctRatio?: number,
  correctAnswer: ?QuizAnswer,
  linkCopied: boolean,
  embedCopied: boolean,
  error?: ?string
}

type QuizTallyResponse = {
  error?: ?string,
  data?: QuizTally
}

type Props = RouteProps & {
  iframe?: boolean
}

export default class Quiz extends React.Component<Props, State> {
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
      theses: [],
      quizSelection: [],
      quizAnswers: [],
      quizIndex: 0,
      correctAnswer: null,
      linkCopied: false,
      embedCopied: false
    }
    this.handleError = Errorhandler.bind(this)
  }

  componentWillMount() {
    if (this.props.iframe === true) {
      const bodyElem = document.getElementsByTagName("BODY")[0]
      bodyElem.setAttribute("style", "min-width: 280px;")
    }
  }

  componentDidMount() {
    this.loadElection()
  }

  componentDidUpdate(prevProps, prevState: State) {
    // Prompt user before navigating away from unfinished quiz
    window.onbeforeunload = () => true
    if (
      prevState.quizIndex !== this.state.quizIndex ||
      prevState.quizAnswers.length !== this.state.quizAnswers.length
    ) {
      window.scrollTo(0, 0)
    }
  }

  componentWillUnmount() {
    window.onbeforeunload = null
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    if (
      nextProps.match.params.electionNum !== this.electionNum ||
      nextProps.displayMode !== this.props.displayMode
    ) {
      this.electionNum = parseInt(nextProps.match.params.electionNum, 10)
      this.territory = nextProps.match.params.territory
      this.setState({
        isLoading: true,
        election: this.getCachedElection(),
        theses: [],
        quizAnswers: []
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

  getRatio({ title, positions }, reverse: boolean = false): number {
    // Determine the ratio of positive votes by summing up the vote results
    // of all parties with positive answers
    if (this.state.election == null) return 0.0

    const results = this.state.election.results

    // Combine results if multiple parties correspond to an entry (CDU + CSU => CDU/CSU)
    // otherwise just return accumulator `acc` + result of party `cur`
    const countVotes = (acc, cur) => {
      if (results[cur["party"]] == null) {
        let multipleLinkedResults = Object.keys(results).filter(
          k => results[k].linked_position === cur["party"]
        )
        return (
          acc +
          multipleLinkedResults
            .map(k => results[k]["pct"])
            .reduce((acc, cur) => acc + cur, 0.0)
        )
      } else {
        return acc + results[cur["party"]]["pct"]
      }
    }

    const ratio = positions
      .filter(p => (reverse ? p.value === -1 : p.value === 1))
      .reduce(countVotes, 0.0)
    return ratio
  }

  handleQuizAnswer(
    thesisQuizIndex: number,
    answer: QuizAnswer,
    correctAnswer: QuizAnswer
  ) {
    let correctRatio = this.tallyCorrectRatio(correctAnswer)
    this.setState({
      quizAnswers: this.state.quizAnswers.concat([answer === correctAnswer]),
      correctAnswer,
      correctRatio
    })
    const thesisNum = extractThesisID(
      this.state.quizSelection[thesisQuizIndex].id
    ).thesisNUM
    this.submitQuizAnswer(thesisNum, answer)
  }

  tallyCorrectRatio(correctAnswer: QuizAnswer) {
    // Return the ratio of correct answers by other users
    let correctRatio
    if (this.state.quizTally != null && correctAnswer !== 0) {
      const currentThesisNum = extractThesisID(
        this.state.quizSelection[this.state.quizIndex].id
      ).thesisNUM
      if (this.state.quizTally[currentThesisNum] != null) {
        const totalAnswers = this.state.quizTally[currentThesisNum].reduce(
          (a, b) => a + b,
          0
        )
        if (totalAnswers > 5) {
          const i = correctAnswer === 1 ? 0 : 1
          correctRatio =
            this.state.quizTally[currentThesisNum][i] / totalAnswers
        }
      }
    }
    return correctRatio
  }

  handleNextQuestion() {
    this.setState(prevState => ({
      quizIndex: prevState.quizIndex + 1,
      correctAnswer: null
    }))
  }

  loadElection(cb?: ElectionType => mixed) {
    const endpoint = API_ROOT + "/elections/" + this.electionNum
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        if (!this.handleError(response)) {
          this.setState(
            {
              election: response.data,
              theses: response.theses || []
            },
            () => {
              this.selectQuizTheses()
              this.loadQuizTally()
            }
          )
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

  loadQuizTally() {
    const endpoint = `${API_ROOT}/quiz/${this.electionNum}`
    fetch(endpoint)
      .then(res => res.json())
      .then((res: QuizTallyResponse) => {
        if (!this.handleError(res)) {
          this.setState({ quizTally: res.data })
        }
      })
      .catch(err => {
        console.log(err)
      })
  }

  selectQuizTheses() {
    const quizSelection = this.state.theses
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .filter(thesis => {
        const ratioPro = this.getRatio(thesis)
        const ratioCon = this.getRatio(thesis, true)
        const rv =
          ratioPro > 15 && ratioCon > 15 && (ratioPro > 50 || ratioCon >= 50)
        return rv
      })
      .slice(0, 20)
    this.setState({ quizSelection, isLoading: false })
  }

  submitQuizAnswer(thesisNum: number, answer: QuizAnswer) {
    if (this.state.error != null || this.state.election == null) return
    const data = {
      answer,
      uuid: loadFromCache("uuid")
    }
    const endpoint = `${API_ROOT}/quiz/${this.state.election.id}/${thesisNum}`
    fetch(endpoint, makeJSONRequest(data)).catch((error: Error) =>
      console.log("Error submitting quiz answer: " + error.message)
    )
  }

  render() {
    let thesis
    let voterOpinionName = ""
    let voterTerritoryName = ""
    let currentThesis

    const quizResult =
      this.state.quizAnswers
        .map(a => (a === true ? 1 : 0))
        .reduce((acc, cur) => acc + cur, 0) / this.state.quizAnswers.length

    if (this.state.isLoading || this.state.error) {
      thesis = null
    } else {
      currentThesis = this.state.quizSelection[this.state.quizIndex]
      thesis = this.state.quizIndex < this.state.quizSelection.length && (
        <Thesis
          key={"quiz-thesis-" + this.state.quizIndex}
          election={this.state.election}
          showHints={true}
          quizMode={true}
          hideTags={true}
          answer={(answer, correctAnswer) =>
            this.handleQuizAnswer(this.state.quizIndex, answer, correctAnswer)
          }
          {...currentThesis}
        />
      )

      voterOpinionName =
        this.state.correctAnswer &&
        {
          "-1": "dagegen",
          "0": "neutral",
          "1": "dafür"
        }[this.state.correctAnswer]

      voterTerritoryName =
        this.state.election.territory === "europa"
          ? "Deutschland"
          : TERRITORY_NAMES[this.state.election.territory]
    }

    const legendShowMissing =
      this.state.election && parseInt(this.state.election.date) < 2008

    const containerClass =
      this.props.iframe === true
        ? "electionContainer quiz iframe"
        : "electionContainer quiz"

    return (
      <Container fluid={false} className={containerClass}>
        <SEO
          title={
            "Metawahl: " +
            (this.state.election ? this.state.election.title + " Quiz" : "Quiz")
          }
        />

        {this.props.iframe !== true && (
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
                href={`/wahlen/${this.territory}/${this.electionNum}/`}
              >
                {Moment(this.state.election.date).year()}
              </Breadcrumb.Section>
            )}

            <span>
              <Breadcrumb.Divider icon="right angle" />
              <Breadcrumb.Section
                active
                href={`/quiz/${this.territory}/${this.electionNum}/`}
              >
                Quiz
              </Breadcrumb.Section>
            </span>
          </Breadcrumb>
        )}
        {this.state.quizAnswers.length === 0 && (
          <Header as="h1">
            {this.state.election == null
              ? " "
              : "Teste dein Wissen: " + this.state.election.title}
          </Header>
        )}

        {this.state.quizAnswers.length === 0 && (
          <h3>
            {this.state.election != null && this.state.election.preliminary
              ? "Was wird die Mehrheit in " +
                TERRITORY_NAMES[this.territory] +
                " voraussichtlich wählen?"
              : "Was hat die Mehrheit in " +
                TERRITORY_NAMES[this.territory] +
                " gewählt?"}
          </h3>
        )}

        {this.state.error != null && (
          <Message negative content={this.state.error} />
        )}

        <Loader active={this.state.isLoading} />

        {/* Main content */}
        {this.state.isLoading === false && (
          <div className="theses">
            {this.state.quizAnswers.length > this.state.quizIndex && (
              <Grid columns="2" stackable className="topGrid">
                <Grid.Column>
                  <Transition
                    visible={
                      this.state.quizAnswers.length > this.state.quizIndex
                    }
                    animation={
                      this.state.quizAnswers[this.state.quizIndex] === true
                        ? "bounce"
                        : "shake"
                    }
                    duration={500}
                  >
                    <Header as="h2">
                      {this.state.quizAnswers[this.state.quizIndex] === true
                        ? "👍 Richtig! " +
                          voterTerritoryName +
                          " stimmt " +
                          voterOpinionName +
                          "."
                        : "👎 Leider falsch. " +
                          voterTerritoryName +
                          " stimmt " +
                          voterOpinionName +
                          "."}
                    </Header>
                  </Transition>
                  {this.state.correctRatio != null && (
                    <p>
                      Diese Frage wurde von{" "}
                      {parseInt(this.state.correctRatio * 100.0, 10)}% der
                      Besucher richtig beantwortet.
                    </p>
                  )}
                </Grid.Column>
                <Grid.Column className="legendCol">
                  <Legend
                    showMissing={legendShowMissing}
                    preliminary={
                      this.state.election && this.state.election.preliminary
                    }
                  />
                </Grid.Column>
              </Grid>
            )}
            {thesis}
          </div>
        )}

        {/* Quiz Result */}
        {this.state.isLoading === false &&
          this.state.quizIndex === this.state.quizSelection.length && (
            <Segment size="large" raised className="quizResult">
              <Header as="h1">
                {quizResult >= 0.5 && (
                  <span>
                    Du bist ein Gewinner! {parseInt(quizResult * 100, 10)}% der
                    Fragen richtig.
                  </span>
                )}
                {quizResult < 0.5 && (
                  <span>
                    Leider verloren. {parseInt(quizResult * 100, 10)}% der
                    Fragen richtig.
                  </span>
                )}
              </Header>

              {this.props.iframe === true && (
                <p>
                  <a href="https://metawahl.de/" _target="blank">
                    <Icon name="caret right" /> Noch mehr Quizzes und
                    Wahlanalysen gibt es auf metawahl.de
                  </a>
                </p>
              )}

              {this.props.iframe !== true && (
                <p>
                  <Link
                    to={
                      "/wahlen/" + this.territory + "/" + this.electionNum + "/"
                    }
                  >
                    <Icon name="caret right" /> Öffne die Übersichtsgrafik zur{" "}
                    {this.state.election.title}
                  </Link>{" "}
                  <br />
                  <Link to={"/wahlen/"}>
                    <Icon name="caret right" /> Siehe alle Wahlen, zu denen es
                    Quizzes gibt
                  </Link>{" "}
                  <br />
                  <Link to="/">
                    <Icon name="caret right" /> Finde heraus, worum es bei
                    Metawahl geht
                  </Link>
                </p>
              )}

              <Button.Group className="stackable">
                <Button
                  as="a"
                  href={
                    "https://www.facebook.com/sharer/sharer.php?u=" +
                    SITE_ROOT +
                    this.props.location.pathname
                  }
                  className="item"
                  color="facebook"
                  rel="nofollow"
                  _target="blank"
                >
                  Quiz auf Facebook teilen
                </Button>
                <Button
                  as="a"
                  href={
                    "https://twitter.com/home?status=" +
                    SITE_ROOT +
                    this.props.location.pathname
                  }
                  className="item"
                  color="twitter"
                  rel="nofollow"
                  _target="blank"
                >
                  Quiz auf Twitter teilen
                </Button>
                <CopyToClipboard
                  text={`<iframe src="${SITE_ROOT}/iframe/quiz/${
                    this.state.election.territory
                  }/${
                    this.state.election.id
                  }" frameborder="0" width="100%" height="600px" scrolling="no" style="overflow: hidden; height: 936.5px;"></iframe>`}
                  onCopy={() => this.setState({ embedCopied: true })}
                >
                  <Button onClick={this.onClick}>
                    <Icon
                      name={this.state.embedCopied ? "check" : "file code"}
                    />{" "}
                    {this.state.embedCopied
                      ? "iFrame-HTML kopiert"
                      : "Einbetten"}
                  </Button>
                </CopyToClipboard>
                <CopyToClipboard
                  text={SITE_ROOT + this.props.location.pathname}
                  onCopy={() => this.setState({ linkCopied: true })}
                >
                  <Button onClick={this.onClick}>
                    <Icon name={this.state.linkCopied ? "check" : "linkify"} />{" "}
                    Link kopieren
                  </Button>
                </CopyToClipboard>
              </Button.Group>
            </Segment>
          )}

        {/* Quiz progress indicator */}
        <Grid stackable verticalAlign="middle" reversed="mobile">
          <Grid.Column width={this.state.quizAnswers.length > 0 ? "12" : "16"}>
            {this.state.quizAnswers.length !==
              this.state.quizSelection.length && (
              <span>
                Noch{" "}
                {this.state.quizSelection.length -
                  this.state.quizAnswers.length}{" "}
                Thesen bis zum Ergebnis
              </span>
            )}

            <Progress
              value={this.state.quizAnswers.length}
              total={this.state.quizSelection.length}
              success={
                this.state.quizIndex === this.state.quizSelection.length &&
                quizResult >= 0.5
              }
            />
          </Grid.Column>
          {this.state.quizAnswers.length > 0 && (
            <Grid.Column width="4" textAlign="right">
              <Button
                color="grey"
                size="large"
                icon
                labelPosition="left"
                disabled={
                  this.state.quizAnswers.length === this.state.quizIndex
                }
                onClick={this.handleNextQuestion}
              >
                <Icon name="right arrow" />
                {this.state.quizIndex + 1 === this.state.quizSelection.length
                  ? "Ergebnis zeigen"
                  : "Nächste Frage"}
              </Button>
              &nbsp;
            </Grid.Column>
          )}
        </Grid>

        {this.props.iframe === true && (
          <SourcesFooter
            election={this.state.election}
            iframe={true}
            context="Dieser Quiz"
          />
        )}
      </Container>
    )
  }
}
