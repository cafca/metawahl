// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Menu, Dropdown, Loader, Label, Icon } from 'semantic-ui-react';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryLabel from './CategoryLabel';

import { API_ROOT, makeJSONRequest, categoryOptions, IS_ADMIN, adminKey } from './Config';
import type { RouteProps, PositionType, ThesisType, OccasionType, TagType } from './Types';
import type { WikidataType } from './WikidataTagger';

const Position = (p) => {
  const hasText = p.text && p.text.length > 0;
  let style = {margin: "0 5px 7px 0"};
  if (hasText) style = {margin: "0 5px 7px 0", borderBottom: "3px solid"};

  return <Label
    className={hasText ? "positionWithText" : "position"}
    basic
    onClick={() => p.toggleOpen()}
    color={p.value === 1 ? "green" : p.value === -1 ? "red" : "grey"}
    style={style}
    pointing={p.open ? "below" : false}>
    {p.party}
  </Label>;
}

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

  sendTagChanges(data: { remove: ?Array<string>, add: ?Array<TagType> }) {
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

  render() {
    const positionLabel = p =>
      <Position
        key={"PositionLabel-" + this.props.id + p.party}
        toggleOpen={() => this.toggleOpen(p)}
        open={this.state.openText != null
          && p.party === this.state.openText.party}
        {...p} />;

    const sortPositions = (a, b) => a.party > b.party;

    let proPositions = this.props.positions
      .filter(p => p.value === 1)
      .map(positionLabel);

    let neutralPositions = this.props.positions
      .filter(p => p.value === 0)
      .map(positionLabel);

    let contraPositions = this.props.positions
      .filter(p => p.value === -1)
      .map(positionLabel);

    const positionText = this.state.openText == null
      ? null : <p>Position der Partei
        {this.state.openText.party}: {this.state.openText.text}</p>;

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

    return <div style={{marginBottom: "1em"}}>
      <Segment id={this.props.id} attached='top'>
        {/* Show title if available */}
        {this.props.title && this.props.title.length > 0 &&
          <div>
            <h2>{this.props.title}</h2>
            <OccasionSubtitle occasion={this.props.occasion} />
            <h4>{this.props.text}</h4>
          </div>
        }

        {/* Alternative: Use thesis text as title*/}
        {(this.props.title == null || this.props.title.length === 0) &&
          <div>
            <h2><span style={{marginLeft: 5}}>{this.props.text}</span></h2>
            <OccasionSubtitle occasion={this.props.occasion} />
          </div>
        }

        <div className="positionsOverview">
          {proPositions}
          {neutralPositions}
          {contraPositions}
        </div>

        {positionText}

        <div>
            { categoryElems }
            { tagElems }
            <br />
            { tagElems.length === 0 && " Noch keine Tags gewählt. "}
            { categoryElems.length === 0 && " Noch keine Kategorie gewählt. "}
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
