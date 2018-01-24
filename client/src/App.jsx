// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom'
import { Container } from 'semantic-ui-react'

import HeaderMenu from './HeaderMenu';
import Footer from './Footer';
import OccasionList from './OccasionList';
import Occasion from './Occasion';
import CategoriesList from './CategoriesList';
import Category from './Category';
import TagList from './TagList';
import TagView from './TagView';
import Territory from './Territory';
import ScrollToTop from './ScrollToTop';



export const loadFromCache = (key: string) => {
  // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;

  let rv = null;
  try {
    rv = localStorage.getItem(key);
  } catch(e) {
    console.log("Error loading from local storage. " + e);
  }
  return rv;
}

export const saveToCache = (key: string, json: string) => {
  // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;

  if (json == null || json === "undefined" || json === "") {
    console.log("Error: Tried saving undefined variable to local storage.")
  } else {
    try {
      localStorage.setItem(key, json);
    } catch(e) {
      console.log("Error saving to local storage. " + e)
    }
  }
}

type State = {
  page: string
};

type Props = {};

class App extends Component<Props, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      page: "Wahlen",
      occasions: {},
      occasionsState: "loading"
    }
    autoBind(this);
  }

  componentDidMount() {
    function uuid(a){
      return a
        ?(a^Math.random()*16>>a/4).toString(16)
        :([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, uuid)
    };
    if(loadFromCache('uuid') == null) saveToCache('uuid', uuid());
  }

  render() {
    return (
      <BrowserRouter>
        <ScrollToTop>
          <div className="App">
            <HeaderMenu />
            <Container text style={{ marginTop: '5em' }}>
              <Route exact path="/" render={props => (
                <OccasionList {...props} />
              )} />

              <Route exact path="/wahlen/:territory/" render={props => (
                <Territory {...props} />
              )} />

              <Route exact path="/wahlen/:territory/:occasionNum/" render={props => (
                <Occasion {...props} />
              )} />

              <Route exact path="/bereiche/" render={props => (
                <CategoriesList {...props} />
              )} />

              <Route exact path="/bereiche/:category/" render={props => (
                <Category {...props} />
              )} />

              <Route path="/bereiche/:category/:page/" render={props => (
                <Category {...props} />
              )} />

              <Route exact path="/tags/" render={props => (
                <TagList {...props} />
              )} />

              <Route exact path="/tags/:tag/" render={props => (
                <TagView {...props} />
              )} />

              <Route path="/tags/:tag/:page/" render={props => (
                <TagView {...props} />
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
