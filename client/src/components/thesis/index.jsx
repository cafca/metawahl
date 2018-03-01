// @flow

import 'moment/locale/de';
import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import {
  Button,
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
          url.indexOf('wahl.tagesschau.de') === -1
            ? sources.push(<span>,
              <a href={url}>Wahlergebnisse: Wikipedia</a></span>)
            : sources.push(<span>,
              <a href={url}>Wahlergebnisse: wahl.tagesschau.de</a></span>)
        );
      }
    }



    return <PositionChart
    parties={this.state.parties}
    toggleOpen={this.toggleOpen} />
  }
}
