// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import 'moment/locale/de';
import {
  Dropdown,
  Header,
  Image,
  Loader,
  Menu,
  Message,
  Segment
} from 'semantic-ui-react';

import './App.css';
import { loadFromCache } from './App';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryLabel from './CategoryLabel';
import PositionChart from './PositionChart';
import Objections from './Objections';

import {
  adminKey,
  API_ROOT,
  categoryOptions,
  COLOR_PALETTE,
  IS_ADMIN,
  makeJSONRequest,
  } from './Config';

import type {
  MergedPartyDataType,
  OccasionType,
  PositionType,
  RouteProps,
  TagType,
  ThesisType
} from './Types';

import type { WikidataType } from './WikidataTagger';

const OccasionSubtitle = ({ occasion }: { occasion?: OccasionType }) =>
  occasion != null &&
    <span>
      <Image
        floated='right'
        style={{height: "3em"}}
        src={`/img/map-${occasion.territory}.svg`}
        title={occasion.territory === 'europa'
          ? 'SVG Europakarte lizensiert unter Public Domain, via Wikimedia Commons (Link siehe Impressum)'
          : 'SVG Deutschlandkarte lizensiert unter Creative Commons Attribution-Share Alike 2.0 Germany und basierend auf Roman Poulvas, David Liuzzo (Karte Bundesrepublik Deutschland.svg), via Wikimedia Commons (Siehe Link im Impressum).'
        }
        alt='Karte Bundesrepublik Deutschland' /> {' '}
      <p style={{fontVariant: "all-small-caps", marginBottom: 0, fontSize: "0.9em"}}>
        <Link to={`/wahlen/${occasion.territory}/${occasion.id}`} style={{color: "rgba(255,255,255,.8)"}}>
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
  categories: Array<string>,
  loading: boolean,
  parties: Array<MergedPartyDataType>,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: -1 | 0 | 1,
  reported: boolean
};

type Props = RouteProps & ThesisType & {
  occasion?: OccasionType,
  linkOccasion?: boolean
};

export default class Thesis extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null,
      tags: this.props.tags,
      categories: this.props.categories,
      loading: false,
      parties: [],
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      ratioPro: 0.5,
      ratioContra: 0.5,
      reported: false
    }
  }

  componentWillMount() {
    this.mergePartyData();
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      tags: nextProps.tags,
      categories: nextProps.categories
    });

    if (Object.is(nextProps.occasion.results, this.props.occasion.results) === false) {
      this.mergePartyData();
    }
  }

  handleCategory(e: SyntheticInputEvent<HTMLInputElement>, { value }: { value: string }) {
    // Avoid duplicates
    if (this.state.categories.indexOf(value) > -1) return;

    this.sendCategoryChanges(value, false);

    this.setState(prevState => ({
      categories: prevState.categories.concat([ value ])
    }));
  }

  handleCategoryRemove(category: string) {
    this.sendCategoryChanges(category, true);
    const categories = this.state.categories.filter(c => c !== category);
    this.setState({categories});
  }

  handleReport() {
    const uuid = loadFromCache('uuid');

    if (uuid != null) {
      const data = {
        uuid,
        text: "",
        thesis_id: this.props.id
      };

      this.setState({reported: true});

      fetch(`${API_ROOT}/react/thesis-report`, makeJSONRequest(data))
        .then(resp => resp.json())
        .then(resp => {
          // TODO: Show success
        })
        .catch(error => {
          this.setState({reported: false});
          console.log(error);
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

  sendCategoryChanges(categoryName: string, remove: boolean) {
    if (categoryName == null) return;

    this.setState({loading: true});

    const endpoint = `${API_ROOT}/categories/${categoryName}`;

    type RequestType = {
      admin_key?: ?string,
      remove?: Array<string>,
      add?: Array<string>
    };

    const data: RequestType = remove === true
      ? {"remove": [this.props.id]}
      : {"add": [this.props.id]};

    data["admin_key"] = adminKey();

    fetch(endpoint, makeJSONRequest(data))
      .then(response => response.json())
      .then(response => {
        console.log(response);
      })
      .catch((error:Error) => {
        console.log(error);
      });
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
      });
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
    const categoryElems = this.state.categories.sort().map(slug =>
      <CategoryLabel
        slug={slug}
        key={"CategoryLabel-" + slug}
        remove={this.handleCategoryRemove}
      />);

    const tagElems = this.state.tags.sort().map(tag =>
      <Tag
        data={tag}
        key={"Tag-" + tag.title}
        remove={this.handleTagRemove}
      />);
    let voterOpinionColor;

    if (this.state.voterOpinion === 0) {
      voterOpinionColor = COLOR_PALETTE[2]
    } else {
      voterOpinionColor = this.state.voterOpinion === -1
        ? COLOR_PALETTE[this.state.ratioContra > 66 ? 0 : 1]
        : COLOR_PALETTE[this.state.ratioPro > 66 ? 4 : 3];
    }

    return <div style={{marginBottom: "2em"}}>
      <Header as='h2' inverted attached="top" size="huge"
        style={{
          backgroundColor: voterOpinionColor,
          minHeight: this.props.linkOccasion ? "4em" : null
        }}>

        { this.props.linkOccasion &&
          <OccasionSubtitle occasion={this.props.occasion} />
        }

        { this.props.linkOccasion === false && (this.props.title != null && this.props.title.length > 0) &&
          <Header.Subheader>
            {this.props.title}
          </Header.Subheader>
        }

        {this.props.text}

        <Header.Subheader>
        {this.state.voterOpinion === 0 ? " Keine Nehrheit dafür oder dagegen"
          : this.state.voterOpinion === 1
            ? ` ${Math.round(this.state.ratioPro)} von 100 Stimmen wählen Parteien, die diese These unterstützen`
            : ` ${Math.round(this.state.ratioContra)} von 100 Stimmen wählen Parteien, die diese These ablehnen`
        }
        </Header.Subheader>
      </Header>

      <Segment id={this.props.id} attached>
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

        <Objections
          id={this.props.id}
          objections={this.props.objections}
          occasionDate={this.props.occasion.date}
          voterOpinion={this.state.voterOpinion}
        />
      </Segment>

      <Segment attached={IS_ADMIN ? true : 'bottom'} secondary>
        <div className="tagContainer">
            { categoryElems }
            { tagElems }
            <br />
            { tagElems.length === 0 && IS_ADMIN &&  " Noch keine Tags gewählt. "}
            { categoryElems.length === 0 && IS_ADMIN && " Noch keine Kategorie gewählt. "}
        </div>
      </Segment>

      { IS_ADMIN &&
        <Menu attached='bottom'>
          <Dropdown
            item
            placeholder='Bereiche wählen'
            style={{border: "none"}}
            search
            selection
            selectOnNavigation={false}
            selectOnBlur={false}
            onChange={this.handleCategory}
            options={categoryOptions}
            value={null}
          />
          <Menu.Menu
            position='right'
            style={{borderLeft: "1px solid #ccc"}}
          >
            <WikidataTagger onSelection={this.handleTag} />
            { this.state.loading && <Loader />}
          </Menu.Menu>
        </Menu>
      }
    </div>
  }
}
