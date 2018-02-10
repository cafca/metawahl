// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import Moment from 'moment';
import 'moment/locale/de';
import {
  Button,
  Comment,
  Dropdown,
  Header,
  Icon,
  Image,
  Label,
  Loader,
  Menu,
  Message,
  Popup,
  Segment
} from 'semantic-ui-react';

import './App.css';
import { loadFromCache } from './App';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryLabel from './CategoryLabel';
import PositionChart from './PositionChart';
import ObjectionForm from './ObjectionForm';

import {
  adminKey,
  API_ROOT,
  categoryOptions,
  COLOR_PALETTE,
  IS_ADMIN,
  makeJSONRequest,
  OBJECTION_NAMES,
  OPINION_COLORS
  } from './Config';

import type {
  ObjectionType,
  OccasionType,
  PositionType,
  RouteProps,
  TagType,
  ThesisType
} from './Types';

import type { WikidataType } from './WikidataTagger';

Moment.locale('de');

const OccasionSubtitle = ({ occasion }: { occasion?: OccasionType }) =>
  occasion != null &&
    <p style={{fontVariant: "all-small-caps", marginBottom: 0, fontSize: "0.9em"}}>
      <Link to={`/wahlen/${occasion.territory}/${occasion.id}`} style={{color: "rgba(255,255,255,.8)"}}>
        {occasion.title}
      </Link>
    </p>;

const valueNames = {
  "-1": "Contra",
  "0": "Neutral",
  "1": "Pro"
};

type State = {
  openText: ?PositionType,
  tags: Array<TagType>,
  categories: Array<string>,
  loading: boolean,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: -1 | 0 | 1,
  voterRatio: number,
  reported: boolean,
  objectionFormOpen: false,
  objections: Array<ObjectionType>
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
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      voterRatio: 0.5,
      reported: false,
      objectionFormOpen: false,
      objections: this.props.objections
    }
  }

  componentWillMount() {
    this.sortPositions();
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      tags: nextProps.tags,
      categories: nextProps.categories
    });

    if (nextProps.results !== this.props.results) {
      this.sortPositions();
      this.updateVoterOpinion();
    }
  }

  handleCategory(e: SyntheticInputEvent<HTMLInputElement>, { value }: { value: string }) {
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

  handleNewObjection(objection: ObjectionType) {
    const objections1 = this.state.objections.slice();
    objections1.push(objection);
    this.setState({
      objectionFormOpen: false,
      objections: objections1
    });
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
    if (position.text == null || position.text.length === 0) {
      this.setState({ openText: Object.assign({}, position, {
        text: "Es liegt keine Begründung zur Position dieser Partei vor."
      })});
    } else {
      this.setState({ openText: position });
    }
  }

  sendCategoryChanges(categoryName: string, remove: boolean) {
    if (categoryName == null) return;

    this.setState({loading: true});

    const endpoint = `${API_ROOT}/categories/${categoryName}`;
    const data = remove === true
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

  sendTagChanges(data: { remove: ?Array<string>, add: ?Array<TagType>, admin_key?: string }) {
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

  sortPositions() {
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

    let proPositions = this.props.positions
      .filter(p => p.value === 1)
      .sort(sortPositions)

    let neutralPositions = this.props.positions
      .filter(p => p.value === 0)
      .sort(sortPositions)

    let contraPositions = this.props.positions
      .filter(p => p.value === -1)
      .sort(sortPositions)

    this.setState({proPositions, neutralPositions, contraPositions},
      this.updateVoterOpinion);
  }

  updateVoterOpinion() {
    const countVotes = (prev, cur) =>
      this.props.occasion.results[cur["party"]] == null
        ? prev
        : prev + this.props.occasion.results[cur["party"]]["pct"];

    let voterOpinion;

    const countPro = this.state.proPositions.reduce(countVotes, 0.0);
    const countContra = this.state.contraPositions.reduce(countVotes, 0.0);

    if (countPro > 50.0) {
      voterOpinion = 1;
    } else if (countContra < 50.0) {
      voterOpinion = 0;
    } else {
      voterOpinion = -1;
    }

    const voterRatio = countPro / (countPro + countContra);

    this.setState({voterOpinion, voterRatio});
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

    const objectionElems = this.state.objections
      .sort((obj1, obj2) => {
        if (obj1.vote_count === obj2.vote_count) {
          return Moment(obj1.date).diff(obj2.date);
        } else {
          return obj1.vote_count > obj2.vote_count ? -1 : 1;
        }
      })
      .map(objection => {
        return <Comment key={"objection-" + objection.id}>
        <Comment.Content>
          <Comment.Author style={{display: 'inline-block'}}>
            <Label as='span' circular empty style={{backgroundColor: OPINION_COLORS[objection.rating.toString()]}} /> {OBJECTION_NAMES[this.state.voterOpinion][objection.rating + 1]}
          </Comment.Author>
          <Comment.Metadata>
              <span>Quelle eingereicht {Moment(objection.date).fromNow()} — </span>
              {Moment(this.props.occasion.date).toNow(true)} nach der Wahl
          </Comment.Metadata>
          <Comment.Text>
            <a href={objection.url} target="_blank">{objection.url}</a>
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action>Problematische Quelle melden</Comment.Action>
          </Comment.Actions>
        </Comment.Content>
      </Comment>;
      });

    const voterOpinionColor = COLOR_PALETTE[
      parseInt(Object.keys(COLOR_PALETTE).length * this.state.voterRatio, 10)
    ];

    return <div style={{marginBottom: "2em"}}>
      <Header as='h2' inverted attached="top" size="huge"
        style={{
          backgroundColor: voterOpinionColor,
          minHeight: this.props.linkOccasion ? "4em" : null
        }}>

        { this.props.linkOccasion &&
          <div>
          <Image
            floated='right'
            style={{height: "3em"}}
            src={`/img/map-${this.props.occasion.territory}.svg`}
            alt='Karte Bundesrepublik Deutschland' /> {' '}
          <OccasionSubtitle occasion={this.props.occasion} />
          </div>
        }

        {this.props.text}

        {(this.props.title != null && this.props.title.length > 0) &&
          <Header.Subheader>
            {this.props.title}
          </Header.Subheader>
        }
      </Header>

      <Segment id={this.props.id} attached>
        <Header sub style={{color: "rgba(0,0,0,.65)"}}>
          Stimmverteilung
        </Header>

        <PositionChart
          positions={this.props.positions}
          results={this.props.occasion.results}
          toggleOpen={this.toggleOpen} />

        { this.state.openText !== null &&
          <Message
            content={this.state.openText.text}
            floating
            header={
              `${this.state.openText.party} -
              ${this.props.occasion.results[this.state.openText.party]["pct"]}% -
              ${valueNames[this.state.openText.value]}`
            } />
        }

        {objectionElems.length === 0 && this.state.objectionFormOpen === false &&
          <Popup
            wide
            header="Im Nachhinein"
            content={"Hast du Informationen zur Umsetzung dieser These?"}
            trigger={
                <Button
                  basic
                  icon
                  as='span'
                  labelPosition='left'
                  disabled={this.state.objectionFormOpen}
                  onClick={() => this.setState({objectionFormOpen: true})}
                  style={{marginTop: "1rem", color: "#333"}}>
                  <Icon name='bullhorn' /> Und, was ist seit dem passiert?
                </Button>
            } />
          }

        {objectionElems.length > 0 &&
          <div className="objections">
            <Header as='h3' dividing style={{marginTop: "2rem"}}>
              Umsetzung
            </Header>

            <Comment.Group>
              {objectionElems}
            </Comment.Group>

            {this.state.objectionFormOpen === false &&
              <Popup
                wide
                header={"Quelle hinzufügen"}
                content={"Weißt du noch mehr zu einer geplanten oder erfolgten Umsetzung dieser These?"}
                trigger={
                    <Button
                      basic
                      icon
                      as='span'
                      labelPosition='left'
                      onClick={() => this.setState({objectionFormOpen: true})}
                      style={{color: "#333"}}>
                      <Icon name='bullhorn' /> Weißt du noch mehr zur Umsetzung?
                    </Button>
                } />
              }
          </div>
        }

        {this.state.objectionFormOpen &&
          <ObjectionForm
            thesis_id={this.props.id}
            voterOpinion={this.state.voterOpinion}
            handleSuccess={this.handleNewObjection}
            handleCancel={() => this.setState({objectionFormOpen: false})} />
        }
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
