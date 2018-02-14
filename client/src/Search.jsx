// @flow

import React from 'react';
import autoBind from 'react-autobind';
import { withRouter } from 'react-router-dom'
import Fuse from 'fuse.js';

import { TERRITORY_NAMES, CATEGORY_NAMES } from './Config';

import type { TagType, OccasionListType, CategoryType } from './Types';

const baseSearchOptions = {
  threshold: 0.2,
  shouldSort: true,
  maxPatternLength: 16,
  location: 0,
};

const tagSearchOptions = Object.assign({}, baseSearchOptions, {
  distance: 30,
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

const categorySearchOptions = Object.assign({}, baseSearchOptions, {
  distance: 30,
  minMatchCharLength: 2,
  keys: ['title']
});

const categoryList = Object.keys(CATEGORY_NAMES).map(k => ({
  'title': CATEGORY_NAMES[k],
  'slug': k,
  'kind': 'category'
}));

type SearchProps = {
  history: {  // React Router history object
    push: string => any
  },
  isLoading: boolean,
  occasions: OccasionListType,
  categories: Array<CategoryType>,
  tags: Array<TagType>
};

type SearchState = {
  isLoading: boolean,
  query: string,
  tagResults: Array<TagType>,
  territoryResults: Array<{[string]: string}>,
  categoryResults: Array<{[string]: string}>
}

class SearchComponent extends React.Component<SearchProps, SearchState> {
  tagSearch;
  territorySearch;
  categorySearch;

  constructor(props: SearchProps) {
    super();
    autoBind(this);
    this.state = {
      isLoading: false,
      query: "",
      tagResults: [],
      territoryResults: [],
      categoryResults: []
    };

    this.tagSearch = new Fuse(
      props.tags, tagSearchOptions);

    this.territorySearch = new Fuse(
      territoryList, territorySearchOptions);

    this.categorySearch = new Fuse(
      categoryList, categorySearchOptions);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isLoading && nextProps.isLoading === false) {
      this.tagSearch = new Fuse(
        nextProps.tags, tagSearchOptions);

      if (this.state.query.length > 0)
        this.updateSearchResults(this.state.query);
    }
  }

  handleResultSelect(result) {
    const baseUrl = result.kind === 'territory'
      ? '/wahlen/'
      : result.kind === 'category'
        ? '/bereiche/'
        : '/tags/';

    this.props.history.push(baseUrl + result.slug);
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
    const categoryResults = this.categorySearch.search(query);

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
        .slice(0,50)
        .sort((a, b) =>
          a.score / (2 * a.thesis_count) < b.score / (2 * b.thesis_count)
            ? -1 : 1
        ).map(res => res.item);
    }



    this.setState({
      isLoading: false,
      tagResults: tagResults.slice(0, 10),
      territoryResults: territoryResults.slice(0, 3),
      categoryResults: categoryResults.slice(0, 3)
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

    const categoryResults = this.state.categoryResults.map(res =>
      <a className="result" key={"result-category-" + res.slug}
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
          <div className='title'>
            {res.title}
            <span style={{color: "rgba(0, 0, 0, 0.4)"}}>
              &nbsp; {res.thesis_count}
            </span>
          </div>
          { res.description &&
            <div className='description'>{res.description}</div>
          }
        </div>

      </a>
    );

    const resultClassName = "results transition" +
      (this.state.query.length === 0 ? "" : " visible");

    return <div className="ui right small inverted menu">
      <div className="ui small item category search right aligned">
        <div className="ui icon input">
          <input className="prompt" type="text" placeholder="Alles ist möglich..."
            onChange={this.handleSearchChange} value={this.state.query}
            style={{borderRadius: 4}} onBlur={this.reset}></input>
          <i className="search icon"></i>
        </div>
        <div className={resultClassName} style={{fontSize: "1.2em"}}>
          {territoryResults.length > 0 &&
            <div className="category">
              <div className="name">Parlamente</div>
              {territoryResults}
            </div>
          }

          {categoryResults.length > 0 &&
            <div className="category">
              <div className="name">Bereiche</div>
              {categoryResults}
            </div>
          }

          {tagResults.length > 0 &&
            <div className="category">
              <div className="name">Themen</div>
              {tagResults}
            </div>
          }

          { tagResults.length + territoryResults.length + categoryResults.length === 0 &&
            <div className="message empty">
              <div className="header">Keine Suchergebnisse</div>
              <div className="description">Leider wurden keine Themen oder Parlamente zu deiner Anfrage gefunden</div>
            </div>
          }
        </div>
      </div>
    </div>
  }
 }

export default withRouter(SearchComponent);
