// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import {
  Segment,
  Menu,
  Dropdown,
  Loader,
  Icon,
  Header,
  Message
} from 'semantic-ui-react';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryLabel from './CategoryLabel';
import PositionChart from './PositionChart';

import {
  API_ROOT,
  makeJSONRequest,
  categoryOptions,
  IS_ADMIN,
  adminKey
  } from './Config';

import type {
  RouteProps,
  PositionType,
  ThesisType,
  OccasionType,
  TagType
} from './Types';

import type { WikidataType } from './WikidataTagger';

const OccasionSubtitle = ({ occasion } : { occasion?: OccasionType }) =>
  occasion != null &&
    <p style={{fontVariant: "small-caps", marginBottom: 0}}>
      <Link to={`/wahlen/${occasion.territory}/${occasion.id}`}>
        {occasion.title}
      </Link>
    </p>;

type State = {
  openText: ?PositionType,
  tags: Array<TagType>,
  categories: Array<string>,
  loading: boolean,
  proPositions: Array<PositionType>,
  neutralPositions: Array<PositionType>,
  contraPositions: Array<PositionType>,
  voterOpinion: "smile" | "meh" | "frown"
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
      voterOpinion: "meh"
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
    if (position.text == null || position.text.length === 0) return;

    this.setState({ openText: position });
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
      voterOpinion = "smile";
    } else if (this.state.contraPositions.reduce(countVotes, 0.0) < 50.0) {
      voterOpinion = "meh";
    } else {
      voterOpinion = "frown";
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

    const valueNames = {
      "-1": "Pro",
      "0": "Neutral",
      "1": "Contra"
    };

    return <div style={{marginBottom: "2em"}}>
      <Header attached="top" size="large">
        <Icon
          name={this.state.voterOpinion}
          style={{float: "right"}}/>

        {this.props.text}

        {(this.props.title != null && this.props.title.length > 0) &&
          <Header.Subheader>
            {this.props.title}
          </Header.Subheader>
        }
      </Header>

      <Segment id={this.props.id} attached>
          { this.props.linkOccasion &&
            <OccasionSubtitle occasion={this.props.occasion} />
          }

        <PositionChart
          positions={this.props.positions}
          results={this.props.occasion.results}
          toggleOpen={this.toggleOpen} />

        { this.state.openText !== null &&
          <Message
            content={this.state.openText.text}
            floating
            header={this.state.openText.party + " - " + valueNames[this.state.openText.value]} />
        }

      </Segment>

      <Segment attached={IS_ADMIN ? true : 'bottom'}>
        <div style={{marginBottom: "-0.4em"}}>
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
