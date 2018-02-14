// @flow

import React from 'react';
import autoBind from 'react-autobind';
import { withRouter } from 'react-router-dom'
import Fuse from 'fuse.js';

import { loadFromCache } from './App';
import { TERRITORY_NAMES } from './Config';

import type { TagType } from './Types';

const baseSearchOptions = {
  threshold: 0.2,
  shouldSort: true,
  maxPatternLength: 16,
  location: 0,
};

const tagSearchOptions = Object.assign({}, baseSearchOptions, {
  distance: 100,
  minMatchCharLength: 3,
  keys: [
    { name: "title", weight: 0.5 },
    { name: "description", weight: 0.2 },
    { name: "aliases", weight: 0.3 }
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
  }
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
  savedTags: Array<TagType>;

  constructor() {
    super();
    autoBind(this);
    this.state = {
      isLoading: false,
      query: "",
      tagResults: [],
      territoryResults: []
    };
    const savedTagsJSON = loadFromCache('tags');
    this.savedTags = savedTagsJSON != null ? JSON.parse(savedTagsJSON) : [];

    this.tagSearch = new Fuse(
      this.savedTags, tagSearchOptions);

    this.territorySearch = new Fuse(
      territoryList, territorySearchOptions);
  }

  handleResultSelect(result) {
    const baseUrl = result.kind === 'territory' ? '/wahlen/' : '/tags/';
    this.props.history.push(baseUrl + result.slug);
    this.reset();
  }

  handleSearchChange(e) {
    const value = e.target.value;
    if ( value.length === 0) return this.reset();

    this.setState({ isLoading: true, query: value });

    const territoryResults = this.territorySearch.search(value);

    let tagResults = [];
    if (value.length < 3) {
      const valueLower = value.toLowerCase();
      tagResults = this.savedTags.filter(
        t => t.title && t.title.toLowerCase().startsWith(valueLower)
      );
    }

    if ((value.length >= 3 || tagResults.length === 0)) {
      tagResults = this.tagSearch.search(value);
    }

    this.setState({
      isLoading: false,
      tagResults: tagResults.slice(0, 10),
      territoryResults: territoryResults.slice(0, 3)
    });
  }

  reset() {
    this.setState({
      isLoading: false,
      tagResults: [],
      territoryResults: [],
      query: ""
    });
  }

  render() {
    const territoryResults = this.state.territoryResults.map(res =>
      <a className="result" key={"result-territory-" + res.slug}
        onClick={() => this.handleResultSelect(res)}>

        <div className="content">
          <div className='title'>{res.title}</div>
        </div>

      </a>
    );

    const tagResults = this.state.tagResults.map(res =>
      <a className="result" key={"result-" + res.slug}
        onClick={() => this.handleResultSelect(res)}>

        <div className="content">
          <div className='title'>{res.title}</div>
          { res.description &&
            <div className='description'>{res.description}</div>
          }
        </div>

      </a>
    );

    const resultClassName = "results transition" + (
      tagResults.length === 0 && territoryResults.length === 0
        ? "" : " visible");

    return <div className="ui right small inverted menu">
      <div className="ui small item category search right aligned">
        <div className="ui icon input">
          <input className="prompt" type="text" placeholder="Suche Themen..."
            onChange={this.handleSearchChange} value={this.state.query}></input>
          <i className="search icon"></i>
        </div>
        <div className={resultClassName} style={{fontSize: "1.2em"}}>
          {territoryResults.length > 0 &&
            <div className="category">
              <div className="name">Parlamente</div>
              {territoryResults}
            </div>
          }
          {tagResults.length > 0 &&
            <div className="category">
              <div className="name">Themen</div>
              {tagResults}
            </div>
          }
        </div>
      </div>
    </div>
  }
 }

export default withRouter(SearchComponent);
