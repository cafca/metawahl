// @flow

import 'moment/locale/de';
import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import {
  Button,
  Dropdown,
  Header,
  Icon,
  Loader,
  Message,
  Popup,
  Responsive,
  Segment
} from 'semantic-ui-react';

import '../../index.css';
import { loadFromCache } from '../../app/';
import WikidataTagger from '../wikidataTagger/';
import Tag from '../tag/';
import PositionChart from '../positionChart/';
import Reactions from '../reactions/';
import Map from '../map/';
import ErrorHandler from '../../utils/errorHandler';

import {
  adminKey,
  API_ROOT,
  COLOR_PALETTE,
  IS_ADMIN,
  makeJSONRequest,
  } from '../../config/';

import type {
  ErrorType,
  MergedPartyDataType,
  OccasionType,
  PositionType,
  RouteProps,
  TagType,
  ThesisType
} from '../../types/';

import type { WikidataType } from '../wikidataTagger/';

import './Thesis.css';

const OccasionSubtitle = ({ occasion }: { occasion?: OccasionType }) =>
  occasion != null &&
    <span>
      <Map
        territory={occasion.territory}
        inverted={true}
        style={{height: "3em", float: 'right', paddingLeft: ".5em"}}
      /> {' '}
      <p style={{
        fontVariant: "all-small-caps",
        marginBottom: ".3rem",
        lineHeight: "1em"
        }}>
        <Link to={`/wahlen/${occasion.territory}/${occasion.id}`} className='item' style={{color: "rgba(255,255,255,.8)"}}>
          {occasion.title}
        </Link>
      </p>
    </span>;

const valueNames = {
  "-1": "Contra",
  "0": "Neutral",
  "1": "Pro"
};

type OpenTextType = PositionType & {
  header?: string
};

type State = {
  ratioPro: number,
  ratioContra: number,
  openText: ?OpenTextType,
  tags: Array<TagType>,
  loading: boolean,
  parties: Array<MergedPartyDataType>,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: -1 | 0 | 1,
  reported: ?boolean,
  reportingError?: string,
  showSources: boolean
};

type Props = RouteProps & ThesisType & {
  occasion?: OccasionType,
  linkOccasion?: boolean,
  showHints?: boolean
};

export default class Thesis extends Component<Props, State> {
  handleError: ErrorType => any;

  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null,
      tags: this.props.tags,
      loading: false,
      parties: [],
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      ratioPro: 0.5,
      ratioContra: 0.5,
      reported: null,
      showSources: false
    }

    this.handleError = ErrorHandler.bind(this);
  }

  componentWillMount() {
    this.mergePartyData();
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      tags: nextProps.tags
    });

    if (Object.is(nextProps.occasion.results, this.props.occasion.results) === false) {
      this.mergePartyData();
    }
  }

  handleReport() {
    const uuid = loadFromCache('uuid');

    if (uuid != null) {
      const data = {
        uuid,
        text: "",
        thesis_id: this.props.id
      };

      this.setState({reported: false});

      fetch(`${API_ROOT}/react/thesis-report`, makeJSONRequest(data))
        .then(resp => resp.json())
        .then(resp => {
          this.setState({
            reported: this.handleError(resp) ? null : true
          });
        })
        .catch(error => {
          this.handleError(error);
          this.setState({reported: null});
          console.log("Error handling report: " + error);
        })
    } else {
      // TODO: Handle no cookies allowed
    }
  }

  handleTag(tagData: WikidataType) {
    if (this.state.tags.filter(t => t.id === tagData.id).length !== 0) return;

    const tag: TagType = {
      title: tagData.label,
      description: tagData.description,
      url: tagData.concepturi,
      wikidata_id: tagData.id,
    };

    if (tagData.wikipedia_title != null) {
      tag.wikipedia_title = tagData.wikipedia_title;
    }
    if (tagData.labels != null) tag.labels = tagData.labels;
    if (tagData.aliases != null) tag.aliases = tagData.aliases;

    this.sendTagChanges({
      add: [ tag ],
      remove: []
    })
  }

  handleTagRemove(title: string) {
    this.sendTagChanges({
      add: [],
      remove: [ title ]
    })
  }

  toggleOpen(position: PositionType) {
    let openText: OpenTextType;
    if (position.value === "missing") {
      openText = Object.assign({}, position, {
        text: "Diese Partei war im Wahl-o-Mat zu dieser Wahl nicht vertreten."
      });
    } else if (position.text == null || position.text.length === 0) {
      openText = Object.assign({}, position, {
        text: "Es liegt keine Begründung zur Position dieser Partei vor."
      });
    } else {
      openText = position;
    }

    const name = this.props.occasion.results[openText.party]["name"]
      || openText.party;
    const result = (this.props.occasion.results[openText.party]["pct"]
      || "<0,1") + "%";
    const posName = Object.keys(valueNames).indexOf(openText.value.toString()) > -1
      ? " — " + valueNames[openText.value] : '' ;
    openText["header"] = `${name} — ${result}${posName}`;

    this.setState({openText});
  }

  sendTagChanges(data: { remove: ?Array<string>, add: ?Array<TagType>, admin_key?: ?string }) {
    this.setState({ loading: true });

    const endpoint = `${API_ROOT}/thesis/${this.props.id}/tags/`;
    data["admin_key"] = adminKey()
    const params = makeJSONRequest(data);

    fetch(endpoint, params)
      .then(response => response.json())
      .then(response => {
        this.setState({
          loading: false,
          tags: response.data.tags
        });
      })
      .catch((error: Error) =>
        console.log("Error changing tag: " + error.message));
  }

  mergePartyData() {
    // Merge party positions with election results
    const res = this.props.occasion.results;
    const sortPositions = (a, b) => {
      if (res != null) {
        // Sort last if vote count unknown
        if (res[a.party] == null) return 1;
        if (res[b.party] == null) return -1;

        if (res[a.party]["votes"] !== res[b.party]["votes"]) {
          return res[a.party]["votes"] > res[b.party]["votes"] ? -1 : 1;
        }
      }

      // Sort by name otherwise
      return a.party > b.party ? 1 : -1;
    }

    const parties = Object.keys(res)
      .map(party => {
        const linked_position = res[party]["linked_position"] || party;
        const rv = Object.assign({},
          res[party],
          this.props.positions.filter(pos =>
              pos.party === linked_position || pos.party === party
            ).shift() || { value: 'missing' },
          { party }
        );
        return rv;
      })

    let proPositions = parties
      .filter(p => p.value === 1)
      .sort(sortPositions)

    let neutralPositions = parties
      .filter(p => p.value === 0)
      .sort(sortPositions)

    let contraPositions = parties
      .filter(p => p.value === -1)
      .sort(sortPositions)

    this.setState({parties, proPositions, neutralPositions, contraPositions},
      this.updateVoterOpinion);
  }

  updateVoterOpinion() {
    const countVotes = (prev, cur) =>
      this.props.occasion.results[cur["party"]] == null
        ? prev
        : prev + this.props.occasion.results[cur["party"]]["pct"];

    let voterOpinion;

    const ratioPro = this.state.proPositions.reduce(countVotes, 0.0);
    const ratioContra = this.state.contraPositions.reduce(countVotes, 0.0);

    if (ratioPro > 50.0) {
      voterOpinion = 1;
    } else if (ratioContra < 50.0) {
      voterOpinion = 0;
    } else {
      voterOpinion = -1;
    }

    this.setState({voterOpinion, ratioPro, ratioContra});
  }

  render() {
    const tagElems = this.state.tags.sort().map(tag =>
      <Tag
        data={tag}
        key={"Tag-" + tag.title}
        remove={this.handleTagRemove}
      />);
    let voterOpinionColor;

    if (this.state.voterOpinion === 0) {
      voterOpinionColor = COLOR_PALETTE[1]
    } else {
      voterOpinionColor = this.state.voterOpinion === -1
        ? COLOR_PALETTE[0]
        : COLOR_PALETTE[2];
    }

    // Collect sources
    let sources = [];
    if (this.props.occasion != null ) {
      sources.push(<span><a href={this.props.occasion.source}>
          Wahl-o-Mat zur {this.props.occasion.title} © Bundeszentrale für politische Bildung
        </a> via <a href="https://github.com/gockelhahn/qual-o-mat-data">
          qual-o-mat-data
        </a></span>)

      if (this.props.occasion.results_sources) {
        this.props.occasion.results_sources.forEach(url =>
          sources.push(<span>,
            <a href={url}>Wahlergebnisse: wahl.tagesschau.de</a></span>
          )
        );
      }
    }



    return <div style={{marginBottom: "2em"}}>
      <Header as='h2' inverted attached="top" size="huge"
        style={{
          backgroundColor: voterOpinionColor,
          minHeight: this.props.linkOccasion ? "4em" : null,
          fontSize: "1.7rem"
        }}>

        { this.props.linkOccasion &&
          <OccasionSubtitle occasion={this.props.occasion} />
        }

        { this.props.linkOccasion === false && (this.props.title != null && this.props.title.length > 0) &&
          <Header.Subheader style={{marginTop: "0.3em"}}>
            {this.props.title}
          </Header.Subheader>
        }

        {this.props.text}

        <Header.Subheader style={{marginTop: "0.3em"}}>
        {this.state.voterOpinion === 0 ? " Keine Mehrheit dafür oder dagegen"
          : this.state.voterOpinion === 1
            ? ` ${Math.round(this.state.ratioPro)} von 100 Wählern gaben ihre Stimme Parteien, die dafür waren`
            : ` ${Math.round(this.state.ratioContra)} von 100 Wählern gaben ihre Stimme Parteien, die dagegen waren`
        }
        </Header.Subheader>
      </Header>

      <Segment id={this.props.id} attached style={{paddingBottom: "1.5em"}}>
        <Header sub style={{color: "rgba(0,0,0,.65)"}}>
          Stimmverteilung
        </Header>

        <PositionChart
          parties={this.state.parties}
          toggleOpen={this.toggleOpen} />

        { this.state.openText != null &&
          <Message
            content={this.state.openText.text}
            floating
            header={this.state.openText.header} />
        }

        { this.props.showHints === true && this.state.openText == null &&
          <Message style={{marginTop: "1rem"}}>
            <Icon name='info circle' /> Klicke die Parteinamen, um deren Position zu dieser These zu lesen. Wenn Parteinamen
            hellgrau sind, so haben diese keine Begründung zu ihrer Position eingereicht, oder waren nicht im Wahl-o-Mat
            vertreten.
          </Message>
        }

        <Reactions
          id={this.props.id}
          reactions={this.props.reactions}
        />

        { this.state.error != null &&
          <Message negative content={this.state.error} />
        }

        <p
          className='sources'
          onClick={() => this.setState({showSources: true})}>
          Quellen{ this.state.showSources && <span>: {sources}</span> }
        </p>

      </Segment>

      <Segment attached={IS_ADMIN ? true : 'bottom'} secondary>
        <div className="tagContainer">
          { this.state.reportingError != null &&
            <Message negative
              header='Fehler beim melden des Beitrags'
              content={this.state.reportingError + 'Schreib uns doch eine email an hallo@metawahl.de, dann kümmern wir uns darum. Danke!'} />
          }
          { this.state.reported === true &&
            <Message positive>
              <Message.Header>
                Meldung abgeschickt
              </Message.Header>
              <Message.Content>
                <p>Wir werden uns diesen Eintrag
                genauer anschauen, wenn mehrere Leute diesen Fehler melden.</p>
                <p>Handelt es sich um einen besonders groben Schnitzer, kannst
                du uns sehr helfen, indem du eine Email
                an <a href='mailto:metawahl@vincentahrend.com'>
                metawahl@vincentahrend.com</a> schreibst
                und kurz erzählst, was hier falsch ist.</p>
                <p>Im <Link to='/legal'>Impressum</Link> findest du auch noch
                weitere Kontaktmöglichkeiten. Vielen Dank für deine Hilfe!</p>
              </Message.Content>
            </Message>
          }

          <Responsive minWidth={600}>
          <Popup
            content="Wenn du Fehler in den Inhalten zu diesem Eintrag entdeckt hast, kannst du uns hier darauf hinweisen."
            header="Fehler melden"
            trigger={
              <Button basic compact icon floated='right'
                loading={this.state.reported === false}
                disabled={this.state.reported === true}
                onClick={this.handleReport}
                style={{marginTop: -2}}
              >
                <Icon name='warning circle' /> Melden
              </Button>
            }
          />
          </Responsive>
          <Responsive maxWidth={600}>
              <Button basic compact icon floated='right'
                loading={this.state.reported === false}
                disabled={this.state.reported === true}
                onClick={this.handleReport}
                style={{marginTop: -2}}
              >
                <Icon name='warning circle' /> Melden
              </Button>
          </Responsive>

          { tagElems }
          <br />
          { tagElems.length === 0 && IS_ADMIN &&  " Noch keine Tags gewählt. "}
        </div>
      </Segment>

      { IS_ADMIN &&
        <Segment attached='bottom' secondary>
          <WikidataTagger onSelection={this.handleTag} style={{float: "right"}} />
          { this.state.loading && <Loader />}
        </Segment>
      }
    </div>
  }
}
