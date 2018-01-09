// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Menu, Dropdown, Loader } from 'semantic-ui-react';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryLabel from './CategoryLabel';

import { API_ROOT, makeJSONRequest, CATEGORY_NAMES, categoryOptions } from './Config';
import type { RouteProps, PositionType, ThesisType, OccasionType, TagType } from './Types';
import type { WikidataType } from './WikidataTagger';

const Position = (p) => {
  const hasText = p.text && p.text.length > 0;
  return <span
    onClick={hasText ? () => p.toggleOpen(p) : null}
    className={hasText ? "positionWithText" : null}
  >
    {p.party}
    ,&nbsp;
  </span>
}

const Positions = ({positions, value, toggleOpen}) =>
  positions.length > 0 && <div className="position_values">
      {value}: {positions.map(p =>
        <Position toggleOpen={toggleOpen} key={p.party} {...p} />
      )}
    </div>;

const OccasionSubtitle = ({ occasion } : { occasion?: OccasionType }) =>
  occasion != null &&
    <p style={{fontVariant: "small-caps"}}>
      <Link to={`/wahlen/${occasion.territory}/${occasion.id}`}>
        {occasion.title} {new Date(occasion.date).getFullYear()}
      </Link>
    </p>;

type State = {
  openText: ?PositionType,
  tags: Array<TagType>,
  categories: Array<string>,
  loading: boolean
};

type Props = RouteProps & ThesisType & { occasion?: OccasionType };

export default class Thesis extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null,
      tags: this.props.tags,
      categories: this.props.categories,
      loading: false
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    this.setState({
      tags: nextProps.tags,
      categories: nextProps.categories
    });
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
    this.setState({ openText: position });
  }

  sendCategoryChanges(categoryName: string, remove: boolean) {
    if (categoryName == null) return;

    this.setState({loading: true});

    const endpoint = `${API_ROOT}/categories/${categoryName}`;
    const data = remove === true
      ? {"remove": [this.props.id]}
      : {"add": [this.props.id]};

    fetch(endpoint, makeJSONRequest(data))
      .then(response => response.json())
      .then(response => {
        console.log(response);
      })
      .catch((error:Error) => {
        console.log(error);
      });
  }

  sendTagChanges(data: { remove: ?Array<string>, add: ?Array<TagType> }) {
    this.setState({ loading: true });

    const endpoint = `${API_ROOT}/thesis/${this.props.id}/tags/`;
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

  render() {
    let proPositions = this.props.positions.filter(p => p.value === 1);
    let neutralPositions = this.props.positions.filter(p => p.value === 0);
    let contraPositions = this.props.positions.filter(p => p.value === -1);

    const positionText = this.state.openText == null
      ? null : <p>Position der Partei \
        {this.state.openText.party}: {this.state.openText.text}</p>;

    const womID = parseInt(this.props.id.split("-")[1], 10);

    const categoryElems = this.state.categories.map(slug =>
      <CategoryLabel
        slug={slug}
        key={"CategoryLabel-" + slug}
        remove={this.handleCategoryRemove}
      />);

    const tagElems = this.state.tags.map(tag =>
      <Tag
        data={tag}
        key={"Tag-" + tag.title}
        remove={this.handleTagRemove}
      />);

    return <div style={{marginBottom: "1em"}}>
      <Segment id={this.props.id} attached='top'>
        {this.props.title && this.props.title.length > 0 &&
          <div>
            <h2>{this.props.title}</h2>
            <OccasionSubtitle occasion={this.props.occasion} />
            <h4>{this.props.text}</h4>
          </div>
        }

        {(this.props.title == null || this.props.title.length === 0) &&
          <div>
            <h2><span style={{marginLeft: 5}}>{this.props.text}</span></h2>
            <OccasionSubtitle occasion={this.props.occasion} />
          </div>
        }

        <div className="positionsOverview">
          <Positions value="Pro" positions={proPositions}
            toggleOpen={this.toggleOpen}/>
          <Positions value="Neutral" positions={neutralPositions}
            toggleOpen={this.toggleOpen}/>
          <Positions value="Contra" positions={contraPositions}
            toggleOpen={this.toggleOpen}/>
        </div>

        {positionText}

        <div>
            { categoryElems }
            { tagElems }
            <br />
            { tagElems.length === 0 && " Noch keine Tags gewählt"}
            { categoryElems.length === 0 && " Noch keine Kategorie gewählt"}
        </div>
      </Segment>
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
    </div>
  }
}
