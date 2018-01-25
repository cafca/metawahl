// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';
import {
  Button,
  Dropdown,
  Header,
  Icon,
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

import {
  adminKey,
  API_ROOT,
  categoryOptions,
  IS_ADMIN,
  makeJSONRequest
  } from './Config';

import type {
  OccasionType,
  PositionType,
  RouteProps,
  TagType,
  ThesisType
} from './Types';

import type { WikidataType } from './WikidataTagger';

const OccasionSubtitle = ({ occasion } : { occasion?: OccasionType }) =>
  occasion != null &&
    <p style={{fontVariant: "all-small-caps", marginBottom: 0, fontSize: "0.9em"}}>
      <Link to={`/wahlen/${occasion.territory}/${occasion.id}`} style={{color: "#666"}}>
        {occasion.title}
      </Link>
    </p>;

  const valueNames = {
    "-1": "Contra",
    "0": "Neutral",
    "1": "Pro"
  };

  const voterOpinionTitles = {
    "-1": "dagegen",
    "0": "neutral",
    "1": "dafür"
  };

  const voterOpinionNames = {
    "-1": "frown",
    "0": "meh",
    "1": "smile"
  };

  const voterOpinionIntro = {
    "-1": "Die Mehrheit der Zweitstimmen ging an Parteien, die sich gegen diese These ausgesprochen haben.",
    "0": `Es ging weder eine Mehrheit der Zweitstimmen an Parteien, die sich für diese These ausgesprochen haben,
      noch ging eine Mehrheit an Parteien, die sich gegen diese These ausgesprochen haben.`,
    "1": "Die Mehrheit der Zweitstimmen ging an Parteien, die sich für diese These ausgesprochen haben."
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
      proPositions: [],
      neutralPositions: [],
      contraPositions: [],
      voterOpinion: 0,
      reported: false
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

    if (this.state.proPositions.reduce(countVotes, 0.0) > 50.0) {
      voterOpinion = 1;
    } else if (this.state.contraPositions.reduce(countVotes, 0.0) < 50.0) {
      voterOpinion = 0;
    } else {
      voterOpinion = -1;
    }

    this.setState({voterOpinion});
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

    return <div style={{marginBottom: "2em"}}>
      <Header attached="top" size="huge">
        { this.props.linkOccasion &&
          <OccasionSubtitle occasion={this.props.occasion} />
        }

        {this.props.text}

        {(this.props.title != null && this.props.title.length > 0) &&
          <Header.Subheader>
            {this.props.title}
          </Header.Subheader>
        }
      </Header>

      <Segment id={this.props.id} attached>
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
      </Segment>

      <Segment attached>
        <Popup
          basic
          on='hover'
          content={voterOpinionIntro[this.state.voterOpinion]}
          offset={20}
          trigger={
            <span style={{marginRight: "1em"}}>
              <Icon
              size='big'
              name={voterOpinionNames[this.state.voterOpinion]}
              /> {`Wähler stimmen ${voterOpinionTitles[this.state.voterOpinion].toLowerCase()}`}
            </span>
          }
        />

        <Popup
          content={this.state.voterOpinion !== 0 ? "Wurde das Anliegen dieser These nicht so umgesetzt, wie es hier angekündigt wurde?" : "Hast du Informationen zu einer geplanten oder erfolgten Umsetzung dieser These?"}
          header={this.state.voterOpinion !== 0 ? "Einspruch erheben" : null}
          wide
          trigger={
            <Button as='span' basic compact disabled={true}
              onClick={this.handleComment} style={{marginTop: -2}}>
              <Icon name='bullhorn' /> {this.state.voterOpinion === -1
                  ? "Wurde trotzdem umgesetzt!"
                  : this.state.voterOpinion === 1
                    ? "Wurde nie umgesetzt!"
                    : "Wurde dies umgesetzt?"}
            </Button>
          } />
      </Segment>

      <Segment attached={IS_ADMIN ? true : 'bottom'}>
        <div className="tagContainer">
            <Popup
              content="Wenn du Fehler in den Inhalten zu diesem Eintrag entdeckt hast, kannst du helfen, indem du mit diesem Button darauf hinweist. Danke!"
              header="Fehler melden"
              wide
              trigger={
                <Button basic compact floated='right' icon disabled={this.state.reported}
                  onClick={this.handleReport} style={{marginTop: -2}}>
                  <Icon name='warning circle' />
                </Button>
              } />

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
