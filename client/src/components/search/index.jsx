// @flow

import React from 'react';
import autoBind from 'react-autobind';
import { withRouter } from 'react-router-dom'
import Fuse from 'fuse.js';

import { TERRITORY_NAMES } from '../../config/';

import type { TagType, OccasionListType } from '../../types/';

const baseSearchOptions = {
  threshold: 0.2,
  shouldSort: true,
  maxPatternLength: 16,
  location: 0,
};

const tagSearchOptions = Object.assign({}, baseSearchOptions, {
  distance: 300,
  tokenize: true,
  minMatchCharLength: 3,
  includeScore: true,
  keys: [
    { name: "title", weight: 1 },
    { name: "description", weight: 0.03 },
    { name: "aliases", weight: 0.1 }
  ]
});

const territorySearchOptions = Object.assign({}, baseSearchOptions, {
  distance: 30,
  minMatchCharLength: 2,
  keys: ['title']
});

const territoryList = Object.keys(TERRITORY_NAMES).map(k => ({
  'title': TERRITORY_NAMES[k],
  'slug': k,
  'kind': 'territory'
}));

type SearchProps = {
  history: {  // React Router history object
    push: string => any
  },
  className?: string,
  large?: boolean,
  isLoading: boolean,
  occasions: OccasionListType,
  tags: Array<TagType>
};

type SearchState = {
  isLoading: boolean,
  query: string,
  tagResults: Array<TagType>,
  territoryResults: Array<{[string]: string}>
}

class SearchComponent extends React.Component<SearchProps, SearchState> {
  tagSearch;
  territorySearch;

  constructor(props: SearchProps) {
    super();
    autoBind(this);
    this.state = {
      isLoading: false,
      query: "",
      tagResults: [],
      territoryResults: []
    };

    this.tagSearch = new Fuse(
      props.tags, tagSearchOptions);

    this.territorySearch = new Fuse(
      territoryList, territorySearchOptions);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isLoading && nextProps.isLoading === false) {
      this.tagSearch = new Fuse(
        nextProps.tags, tagSearchOptions);

      if (this.state.query.length > 0)
        this.updateSearchResults(this.state.query);
    }
  }

  handleResultSelect(e: Event, result) {
    e.preventDefault()
    const baseUrl = result.kind === 'territory'
      ? '/wahlen/'
      : '/themen/';

    this.props.history.push(baseUrl + result.slug + '/');
    this.reset();
  }

  handleSearchChange(e) {
    const value = e.target.value;
    if ( value.length === 0) return this.reset();
    this.updateSearchResults(value);
  }

  reset() {
    this.setState({
      isLoading: false,
      tagResults: [],
      territoryResults: [],
      query: ""
    });
  }

  updateSearchResults(query) {
    this.setState({ isLoading: true, query });

    const territoryResults = this.territorySearch.search(query);

    let tagResults = [];
    if (query.length < 3) {
      const valueLower = query.toLowerCase();
      tagResults = this.props.tags.filter(
        t => t.title && t.title.toLowerCase().startsWith(valueLower)
      ).sort((a, b) => a.thesis_count > b.thesis_count ? -1 : 1);
    }

    if ((query.length >= 3 || tagResults.length === 0)) {
      tagResults = this.tagSearch
        .search(query)
        .map(res => Object.assign(res.item, { score: res.score }));

      tagResults.sort((a, b) =>
        -1 * (a.thesis_count / a.score - b.thesis_count / b.score)
      )
    }

    this.setState({
      isLoading: false,
      tagResults: tagResults.slice(0, 10),
      territoryResults: territoryResults.slice(0, 3)
    });
  }

  render() {
    const territoryResults = this.state.territoryResults.map(res =>
      <a className="result" key={"result-territory-" + res.slug} href={`/wahlen/${res.slug}/`}
        onClick={(e) => this.handleResultSelect(e, res)}>

        <div className="content">
          <div className='title'>{res.title}</div>
        </div>

      </a>
    );

    const tagResults = this.state.tagResults.map(res =>
      <span className="result" key={"result-" + res.slug}
        onClick={this.handleResultSelect}>

        <div className="content">
          <div className='title'>
            {res.title}
            <span style={{color: "rgba(0, 0, 0, 0.3)", float: "right"}}>
              &nbsp; {res.thesis_count}
            </span>
          </div>
          { res.description &&
            <div className='description'>{res.description}</div>
          }
        </div>

      </span>
    );

    const resultClassName = "results transition" +
      (this.state.query.length === 0 ? "" : " visible");

    let className = "ui category search "
    if (this.props.className != null) className += this.props.className;

    return <div className={className} >
      <div className="ui icon input">
        <input className="prompt" type="text" placeholder="Alles ist möglich..."
          onChange={this.handleSearchChange} value={this.state.query}
          style={{borderRadius: 4}}></input>
        <i className="search icon"></i>
      </div>
      <div className={resultClassName}
        style={this.props.large ? {fontSize: 14} : null}>

        {territoryResults.length > 0 &&
          <div className="category">
            <div className="name" style={{marginTop: 7}}>Gebiete</div>
            {territoryResults}
          </div>
        }

        {tagResults.length > 0 &&
          <div className="category">
            <div className="name" style={{marginTop: 7}}>Themen</div>
            {tagResults}
          </div>
        }

        { tagResults.length + territoryResults.length === 0 &&
          <div className="message empty">
            <div className="header">Keine Suchergebnisse</div>
            <div className="description">Leider wurden keine Themen oder Parlamente zu deiner Anfrage gefunden</div>
          </div>
        }
      </div>
    </div>
  }
 }

export default withRouter(SearchComponent);
