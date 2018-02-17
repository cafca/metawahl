// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
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
import NotFound from './NotFound';
import SEO from './SEO';

import type {
  OccasionListType, TagType, CategoryType, ErrorType
} from './Types';

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

export function errorHandler(error: ErrorType, target?: string) {
  let errorMessage = null;

  // Error error
  if (error.message != null) errorMessage = error.message;

  // API error
  if (error.error != null && error.error.length > 0) errorMessage = error.error;

  if (errorMessage === "Failed to fetch")
    errorMessage = "Keine Verbindung zum Metawahl-Server";

  if (errorMessage != null) {
    console.log(errorMessage);
    this.setState({ [target || "error"]: errorMessage });
    return true
  } else {
    return false;
  }
};

type State = {
  error?: ?string,
  isLoading: boolean,
  occasions: OccasionListType,
  tags: Array<TagType>,
  categories: Array<CategoryType>
};

type Props = {};

class App extends Component<Props, State> {
  handleError: ErrorType => any;

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
    this.handleError = errorHandler.bind(this);
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
        if (!this.handleError(response)) {
          this.setState({
            occasions: response.data.occasions,
            tags: response.data.tags,
            categories: response.data.categories,
            isLoading: false
          });

          saveToCache('occasions', JSON.stringify(response.data.occasions));
          saveToCache('tags', JSON.stringify(response.data.tags));
          saveToCache('categories', JSON.stringify(response.data.categories));
        } else {
          this.setState({
            isLoading: false
          });
        }
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
            <SEO
              title='Metawahl'
              description='Wahl-o-Mat im Nachhinein: Was für eine Politik haben wir gewählt – und haben wir sie auch bekommen?'
            />
            <Route path='/:area?' render={props => <HeaderMenu {...props} {...context} />} />

            <Container text id="outerContainer">
              { !process.env.NODE_ENV && process.env.NODE_ENV !== 'development' &&
                <Message warning>
                  Metawahl wird erst am 28. Februar 2018 offiziell veröffentlich.
                  Diese Vorabversion kann inhaltliche und technische Fehler beinhalten.
                </Message>
              }

              { this.state.error != null &&
                <Message negative header="Upsi" content={this.state.error} />
              }

              <Switch>
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

                <Route exact path="/themen/" render={props => (
                  <TagList {...props} {...context} />
                )} />

                <Route path="/themen/:tag/:page?/" render={props => (
                  <TagView {...props} {...context} />
                )} />

                <Route path="/legal/" render={props => (
                  <LegalView {...props} {...context} />
                )} />

                <Route render={props => <NotFound {...props} {...context} />}/>
              </Switch>
            </Container>
            <Footer {...context} />
          </div>
        </ScrollToTop>
      </BrowserRouter>
    );
  }
}

export default App;
