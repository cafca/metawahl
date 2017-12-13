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

  try {
    localStorage.setItem(key, json);
  } catch(e) {
    console.log("Error saving to local storage. " + e)
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

  render() {
    return (
      <BrowserRouter>
        <ScrollToTop>
          <div className="App">
            <HeaderMenu />
            <Container text style={{ marginTop: '7em' }}>
              <Route exact path="/" render={props => (
                <OccasionList {...props} />
              )} />

              <Route path="/wahlen/:occasionNum/" render={props => (
                <Occasion {...props} />
              )} />

              <Route exact path="/bereiche/" render={props => (
                <CategoriesList {...props} />
              )} />

              <Route path="/bereiche/:category/" render={props => (
                <Category {...props} />
              )} />

              <Route exact path="/tags/" render={props => (
                <TagList {...props} />
              )} />

              <Route path="/tags/:tag/" render={props => (
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
