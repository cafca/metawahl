// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Menu, Dropdown } from 'semantic-ui-react';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryRibbon from './CategoryRibbon';

import type { RouteProps, PositionType, ThesisType, TagType } from './Types';
import type { WikidataType } from './WikidataTagger';

const categoryNames : Array<string> = [
  "Arbeit und Beschäftigung",
  "Ausländerpolitik, Zuwanderung",
  "Außenpolitik und internationale Beziehungen",
  "Außenwirtschaft",
  "Bildung und Erziehung",
  "Bundestag",
  "Energie",
  "Entwicklungspolitik",
  "Europapolitik und Europäische Union",
  "Gesellschaftspolitik, soziale Gruppen",
  "Gesundheit",
  "Innere Sicherheit",
  "Kultur",
  "Landwirtschaft und Ernährung",
  "Medien, Kommunikation und Informationstechnik",
  "Neue Bundesländer",
  "Öffentliche Finanzen, Steuern und Abgaben",
  "Politisches Leben, Parteien",
  "Raumordnung, Bau- und Wohnungswesen",
  "Recht",
  "Soziale Sicherung",
  "Sport, Freizeit und Tourismus",
  "Staat und Verwaltung",
  "Umwelt",
  "Verkehr",
  "Verteidigung",
  "Wirtschaft",
  "Wissenschaft, Forschung und Technologie"
];

export const categoryOptions = categoryNames.map(
  name => ({key: name, value: name, text: name}));

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
      {value}: {positions.map(p => <Position toggleOpen={toggleOpen} key={p.party} {...p} />)}
    </div>;

type State = {
  openText: ?PositionType,
  tags: Array<TagType>,
  categories: Array<string>
};

type Props = RouteProps & ThesisType;

export default class Thesis extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null,
      tags: this.props.tags,
      categories: this.props.categories
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    nextProps.tags.forEach(this.handleTag);
    nextProps.categories.forEach(this.handleCategory);
  }

  handleCategory(e: SyntheticInputEvent<HTMLInputElement>, { value }: { value: string }) {
    if (this.state.categories.indexOf(value) > -1) return;

    this.setState(prevState => {
      categories: prevState.categories.concat([ value ])
    });
  }

  handleCategoryRemove(category: string) {
    const categories = this.state.categories.filter(c => c !== category);
    this.setState({categories});
  }

  handleTag(tagData: WikidataType) {
    if (this.state.tags.filter(t => t.id === tagData.id).length !== 0) return;

    const tag: TagType = {
      title: tagData.label,
      description: tagData.description,
      url: tagData.concepturi,
      wikidata_id: tagData.id
    };

    this.setState({
      tags: this.state.tags.concat([ tag ])
    });
  }

  handleTagRemove(title: string) {
    const tags = this.state.tags.filter(tag => tag.title !== title);
    this.setState({tags});
  }

  toggleOpen(position: PositionType) {
    this.setState({ openText: position });
  }

  render() {
    let proPositions = this.props.positions.filter(p => p.value === 1);
    let neutralPositions = this.props.positions.filter(p => p.value === 0);
    let contraPositions = this.props.positions.filter(p => p.value === -1);

    const positionText = this.state.openText == null
      ? null : <p>Position der Partei {this.state.openText.party}: {this.state.openText.text}</p>;

    const womID = parseInt(this.props.id.split("-")[1], 10);

    const tagElems = this.state.tags.map(tag =>
      <Tag data={tag} key={tag.title} remove={this.handleTagRemove} />);

    return <div style={{marginBottom: "1em"}}>
      <Segment id={this.props.id} attached='top'>
        <CategoryRibbon
          categories={this.state.categories}
          remove={this.handleCategoryRemove} />

        {this.props.title && this.props.title.length > 0 &&
          <span>
          <Link to={`/wahlen/${womID}/#${this.props.id}`}><h2>{this.props.title}</h2></Link>
          <h4>{this.props.text}</h4>
          </span>
        }

        {(this.props.title == null || this.props.title.length === 0) &&
          <Link to={`/wahlen/${womID}/#${this.props.id}`}><h2>
            <span style={{marginLeft: 5}}>{this.props.text}</span>
          </h2></Link>
        }
        <div className="positionsOverview">
          <Positions value="Pro" positions={proPositions} toggleOpen={this.toggleOpen}/>
          <Positions value="Neutral" positions={neutralPositions} toggleOpen={this.toggleOpen}/>
          <Positions value="Contra" positions={contraPositions} toggleOpen={this.toggleOpen}/>
        </div>
        {positionText}
        <div>
            { tagElems.length === 0 && " Noch keine Tags gewählt"}
            { tagElems }
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
        </Menu.Menu>
      </Menu>
    </div>
  }
}
