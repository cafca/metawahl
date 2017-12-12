// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Menu, Dropdown, Loader } from 'semantic-ui-react';
import WikidataTagger from './WikidataTagger';
import Tag from './Tag';
import CategoryRibbon from './CategoryRibbon';
import { API_ROOT, makeJSONRequest } from './Config';

import type { RouteProps, PositionType, ThesisType, TagType } from './Types';
import type { WikidataType } from './WikidataTagger';

const categoryNames : {[string]: [string]} = {
  "arbeit-und-beschaftigung": "Arbeit und Beschäftigung",
  "auslanderpolitik-zuwanderung": "Ausländerpolitik, Zuwanderung",
  "aussenpolitik-und-internationale-beziehungen": "Außenpolitik und internationale Beziehungen",
  "aussenwirtschaft": "Außenwirtschaft",
  "bildung-und-erziehung": "Bildung und Erziehung",
  "bundestag": "Bundestag",
  "energie": "Energie",
  "entwicklungspolitik": "Entwicklungspolitik",
  "europapolitik-und-europaische-union": "Europapolitik und Europäische Union",
  "gesellschaftspolitik-soziale-gruppen": "Gesellschaftspolitik, soziale Gruppen",
  "gesundheit": "Gesundheit",
  "innere-sicherheit": "Innere Sicherheit",
  "kultur": "Kultur",
  "landwirtschaft-und-ernahrung": "Landwirtschaft und Ernährung",
  "medien-kommunikation-und-informationstechnik": "Medien, Kommunikation und Informationstechnik",
  "neue-bundeslander": "Neue Bundesländer",
  "politisches-leben-parteien": "Politisches Leben, Parteien",
  "raumordnung-bau-und-wohnungswesen": "Raumordnung, Bau- und Wohnungswesen",
  "recht": "Recht",
  "soziale-sicherung": "Soziale Sicherung",
  "sport-freizeit-und-tourismus": "Sport, Freizeit und Tourismus",
  "staat-und-verwaltung": "Staat und Verwaltung",
  "umwelt": "Umwelt",
  "verkehr": "Verkehr",
  "verteidigung": "Verteidigung",
  "wirtschaft": "Wirtschaft",
  "wissenschaft-forschung-und-technologie": "Wissenschaft, Forschung und Technologie",
  "offentliche-finanzen-steuern-und-abgaben": "Öffentliche Finanzen, Steuern und Abgaben"
};

export const categoryOptions = Object.keys(categoryNames).map(
  slug => ({key: slug, value: slug, text: categoryNames[slug]}));

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
  categories: Array<string>,
  loading: boolean
};

type Props = RouteProps & ThesisType;

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

    this.sendChanges({
      add: [ tag ],
      remove: []
    })
  }

  handleTagRemove(title: string) {
    const tags = this.state.tags.filter(tag => tag.title !== title);
    this.setState({tags});
    this.sendChanges({
      add: [],
      remove: [ title ]
    })
  }

  toggleOpen(position: PositionType) {
    this.setState({ openText: position });
  }

  sendChanges(data: { remove: ?Array<string>, add: ?Array<TagType> }) {
    this.setState({ loading: true });

    const endpoint = `${API_ROOT}/thesis/${this.props.id}/tags/`;
    const params = makeJSONRequest(data);

    fetch(endpoint, params)
      .then(response => response.json())
      .then(response => {
        this.setState({ loading: false });
      });
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
          { this.state.loading && <Loader />}
        </Menu.Menu>
      </Menu>
    </div>
  }
}
