// @flow

import wikidata from '../node_modules/wikidata-sdk/dist/wikidata-sdk';
import React from 'react';
import autoBind from 'react-autobind';
import { Menu, Search, Icon } from 'semantic-ui-react';

import { loadFromCache, saveToCache } from './App';

const searchLanguage = "de";

export type WikidataType = {
  concepturi: string,
  description: string,
  id: string,
  label: string,
  match: {
    language: string,
    text: string,
    type: string
  },
  pageid: number,
  repository: string,
  title: string,
  url: string
};

type Props = {
  onSelection: (WikidataType) => mixed,
  text?: string
};

type State = {
  existingTags: Array<string>,
  query: string,
  isLoading: boolean,
  results: Array<WikidataType>,
  open: boolean,
};

class WikidataTagger extends React.Component<Props, State> {
  searchTimeout: number;

  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      existingTags: [],
      query: '',
      isLoading: false,
      results: [],
      open: false
    }
  }

  cancelLoading() {
    clearTimeout(this.searchTimeout);
    this.setState({isLoading: false});
  }

  componentDidMount() {
    this.loadExistingTags();
  }

  search(): Promise<any> {
    const query = this.state.query;
    return new Promise((resolve, reject) => {
      const url = wikidata.searchEntities({
        search: query,
        language: searchLanguage,
        limit: 5
      });

      fetch(url)
        .then(response => response.json())
        .then(results => {
          if (results.success === 1) {
            resolve(results.search);
          } else {
            reject();
          }
        })
        .catch(error => {
          console.log(`Error searching for ${query}: ${error}`);
          reject(error);
        });
    });
  }

  handleChange(e: SyntheticInputEvent<HTMLInputElement>) {
    const query = e.target.value;
    const isQueryValid = query != null && query.length >= 3;
    const isUnique = (current, index, items) =>
      index === items.map(t => t.id).indexOf(current.id);

    this.setState({
      query,
      isLoading: isQueryValid
    });

    const cachedResults = this.getCachedResults(query);

    if (isQueryValid) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(query => {
        this.search().then(results => {
          this.setState({
            results: cachedResults
              .concat(results)
              .filter(isUnique),
            isLoading: false
          });
        })
      },
      350);
    } else {
      this.setState({ results: cachedResults });
    }
  }

  handleSelect(e: SyntheticInputEvent<HTMLInputElement>, { result }: { result: WikidataType }) {
    this.props.onSelection(result);
    this.setState({query: '', results: [], isLoading: false});
    this.addToCached(result);
  }

  renderResult({ title, label, description, concepturi }: WikidataType) {
    const isExistingTag = this.state.existingTags.indexOf(title) > -1
      ? <Icon name="star" /> : null;

    return <div key='content' className='content'>
      {title && <div className='price'>{title}</div>}
      {label && <div className='title'>{isExistingTag}{label}</div>}
      {description && <div className='description'>{description}</div>}
    </div>
  }

  addToCached(tag: WikidataType) {
    const cachedJSON = loadFromCache('recent-tags');
    const cached = cachedJSON == null ? [] : JSON.parse(cachedJSON);
    if (cached.map(e => e.title).indexOf(tag.title) === -1) {
      cached.unshift(tag);
    }
    saveToCache('recent-tags', JSON.stringify(cached))
    this.setState({existingTags: this.state.existingTags.concat(tag.id)});
  }

  getCachedResults(query: string): Array<WikidataType> {
    let rv = [];
    const cachedJSON = loadFromCache('recent-tags');
    if (cachedJSON != null) {
      rv = JSON.parse(cachedJSON).filter(
        t => t.label.toLowerCase().startsWith(query.toLowerCase()))
    }
    return rv;
  }

  loadExistingTags() {
    const cachedJSON = loadFromCache('taglist');
    if (cachedJSON != null) {
      this.setState({
        existingTags: JSON.parse(cachedJSON).map(t => t.wikidata_id)
      });
    }
  }

  render() {
    const style = {border: "none"};
    return <Menu.Menu>
      <Search
        className="searchNoBorder"
        icon="hashtag"
        loading={this.state.isLoading}
        onFocus={this.loadExistingTags}
        onResultSelect={this.handleSelect}
        onSearchChange={this.handleChange}
        onSelectionChange={this.cancelLoading}
        placeholder={this.props.text || "Tag hinzufügen"}
        results={this.state.results}
        resultRenderer={this.renderResult}
        style={style}
        value={this.state.query}
      />
    </Menu.Menu>
  }
}

export default WikidataTagger;
