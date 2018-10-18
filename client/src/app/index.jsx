// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Message } from 'semantic-ui-react'

import '../index.css';
import Header from '../components/header/';
import Footer from '../components/footer/';
import SEO from '../components/seo/';
import { API_ROOT } from '../config/';
import Landing from  '../views/landing';
import ElectionList from '../views/electionList/';
import Election from '../views/election/';
import Quiz from '../views/election/quiz';
import NotFound from '../views/notFound/';
import LegalView from '../views/legal';
import TagList from '../views/tagList/';
import TagOverview from '../views/tagOverview/';
import TagView from '../views/tag/';
import Thesis from '../views/thesis/';
import Territory from '../views/territory';
import DataOverview from '../views/data';
import ScrollToTop from '../utils/ScrollToTop';
import ErrorHandler from '../utils/errorHandler';

import type {
  ElectionListType, TagType, ErrorType
} from '../../types/';

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
  error?: ?string,
  isLoading: boolean,
  elections: ElectionListType,
  tags: Array<TagType>
};

type Props = {};

class App extends Component<Props, State> {
  handleError: ErrorType => any;

  constructor(props: {}) {
    super(props);

    const electionsJSON = loadFromCache('elections');
    const tagsJSON = loadFromCache('tags');

    this.state = {
      isLoading: electionsJSON == null || tagsJSON == null,
      elections: electionsJSON != null ? JSON.parse(electionsJSON) : {},
      tags: tagsJSON != null ? JSON.parse(tagsJSON) : []
    }
    autoBind(this);
    this.handleError = ErrorHandler.bind(this);
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
            elections: response.data.elections,
            tags: response.data.tags,
            isLoading: false
          });

          saveToCache('elections', JSON.stringify(response.data.elections));
          saveToCache('tags', JSON.stringify(response.data.tags));
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
            />

            <Route path='/:area?' render={props => <Header {...props} {...context} />} />

            { this.state.error != null &&
              <Message negative header="Upsi" content={this.state.error} />
            }

            <Switch>
              <Route exact path='/' render={props => (
                <Landing {...props} {...context} />
              )} />

              <Route exact path="/wahlen/" render={props => (
                <ElectionList {...props} {...context} />
              )} />

              <Route exact path="/wahlen/:territory/" render={props => (
                <Territory {...props} {...context} />
              )} />

              <Route exact path="/wahlen/:territory/:electionNum/" render={props => (
                <Election {...props} {...context} />
              )} />

              <Route exact path="/quiz/:territory/:electionNum/" render={props => (
                <Quiz {...props} {...context} />
              )} />

              <Route exact path="/wahlen/:territory/:electionNum/:thesisNum/" render={props => (
                <Thesis {...props} {...context} />
              )} />

              <Route exact path="/themen/" render={props => (
                <TagOverview {...props} {...context} />
              )} />

              <Route exact path="/themenliste/" render={props => (
                <TagList {...props} {...context} />
              )} />

              <Route exact path="/themen/:tag/:page?/" render={props => (
                <TagView {...props} {...context} />
              )} />

              <Route exact path="/daten/" render={props => (
                <DataOverview {...props} {...context} />
              )} />

              <Route exact path="/legal/" render={props => (
                <LegalView {...props} {...context} />
              )} />

              <Route render={props => <NotFound {...props} {...context} />}/>
            </Switch>

            <Footer {...context} />
          </div>
        </ScrollToTop>
      </BrowserRouter>
    );
  }
}

export default App;
