// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { BrowserRouter, Route } from 'react-router-dom'
import { Container, Message } from 'semantic-ui-react'

import './App.css';
import { API_ROOT } from './Config';
import HeaderMenu from './HeaderMenu';
import Footer from './Footer';
import OccasionList from './OccasionList';
import Occasion from './Occasion';
import CategoriesList from './CategoriesList';
import Category from './Category';
import LegalView from './LegalView';
import TagList from './TagList';
import TagView from './TagView';
import Territory from './Territory';
import ScrollToTop from './ScrollToTop';

import type { OccasionListType, TagType, CategoryType } from './Types';

export const loadFromCache = (key: string) => {
  // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;
  let localStorage = document.defaultView.localStorage;

  if (localStorage == null) {
    localStorage = {};
  }

  let rv = null;
  if (typeof localStorage.getItem === 'function') {
    try {
      rv = localStorage.getItem(key);
    } catch(e) {
      console.log("Error loading from local storage. " + e);
    }
  } else {
    rv = localStorage[key];
  }
  return rv;
}

export const saveToCache = (key: string, json: string) => {
  // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;
  let localStorage = document.defaultView.localStorage;

  if (localStorage == null) {
    localStorage = {};
  }

  if (json == null || json === "undefined" || json === "") {
    console.log("Error: Tried saving undefined variable to local storage.")
  } else if (typeof localStorage.setItem === 'function') {
    try {
      localStorage.setItem(key, json);
    } catch(e) {
      console.log("Error saving to local storage. " + e)
    }
  } else {
    localStorage[key] = json;
  }
}

type State = {
  isLoading: boolean,
  occasions: OccasionListType,
  tags: Array<TagType>,
  categories: Array<CategoryType>
};

type Props = {};

class App extends Component<Props, State> {
  constructor(props: {}) {
    super(props);

    const categoriesJSON = loadFromCache('categories');
    const occasionsJSON = loadFromCache('occasions');
    const tagsJSON = loadFromCache('tags');

    this.state = {
      isLoading: categoriesJSON == null || occasionsJSON == null || tagsJSON == null,
      categories: categoriesJSON != null ? JSON.parse(categoriesJSON) : [],
      occasions: occasionsJSON != null ? JSON.parse(occasionsJSON) : {},
      tags: tagsJSON != null ? JSON.parse(tagsJSON) : []
    }
    autoBind(this);
  }

  componentDidMount() {
    // Assign a unique id to this browser on mount
    function uuid(a){
      return a // eslint-disable-next-line no-mixed-operators
        ? (a^Math.random()*16>>a/4).toString(16)
        : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, uuid)
    };
    if(loadFromCache('uuid') == null) saveToCache('uuid', uuid());

    if (this.state.isLoading) this.fillCaches();
  }

  fillCaches() {
    // Fetch base dataset
    fetch(`${API_ROOT}/base`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          occasions: response.data.occasions,
          tags: response.data.tags,
          categories: response.data.categories,
          isLoading: false
        });

        saveToCache('occasions', JSON.stringify(response.data.occasions));
        saveToCache('tags', JSON.stringify(response.data.tags));
        saveToCache('categories', JSON.stringify(response.data.categories));
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            isLoading: false
          });
        }
      }
    );
  }

  render() {
    const context = this.state;

    return (
      <BrowserRouter>
        <ScrollToTop>
          <div className="App">
            <HeaderMenu {...context} />

            <Container text id="outerContainer">
              <Message warning>
                Metawahl wird erst am 28. Februar 2018 offiziell veröffentlich.
                Diese Vorabversion kann inhaltliche und technische Fehler beinhalten.
              </Message>

              <Route exact path="/" render={props => (
                <OccasionList {...props} {...context} />
              )} />

              <Route exact path="/wahlen/:territory/" render={props => (
                <Territory {...props} {...context} />
              )} />

              <Route exact path="/wahlen/:territory/:occasionNum/" render={props => (
                <Occasion {...props} {...context} />
              )} />

              <Route exact path="/bereiche/" render={props => (
                <CategoriesList {...props} {...context} />
              )} />

              <Route path="/bereiche/:category/:page?/" render={props => (
                <Category {...props} {...context} />
              )} />

              <Route exact path="/tags/" render={props => (
                <TagList {...props} {...context} />
              )} />

              <Route path="/tags/:tag/:page?/" render={props => (
                <TagView {...props} {...context} />
              )} />

              <Route path="/legal" render={props => (
                <LegalView {...props} {...context} />
              )} />
            </Container>
            <Footer />
          </div>
        </ScrollToTop>
      </BrowserRouter>
    );
  }
}

export default App;
