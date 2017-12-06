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

import type { OccasionType, CategoryType, PositionType, RouteProps } from './Types';

// const DATA_DIR = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
//   ? "/data" : "/tamolhaw/data";

const DATA_DIR = "/data";
const API_ROOT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "http://localhost:8000/api/v1"
  : "http://demo.vincentahrend.com:9000/api/v1/";

type State = {
  page: string,
  occasionsState: string,
  occasions: ?{ [ womID: number ]: OccasionType },
  categoriesState: string,
  categories: ?{ [ category: string ]: CategoryType },
  positions: ?{ [ womID: number ]: PositionType }
};

type Props = {};

class App extends Component<Props, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      page: "Wahlen",
      occasionsState: "loading",
      occasions: {},
      categoriesState: "loading",
      categories: {},
      positions: {}
    }
    autoBind(this);
  }

  load(key: string) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;

    let rv = null;
    try {
      rv = localStorage.getItem(key);
    } catch(e) {
      console.log("Error loading from local storage. " + e);
    }
    return rv;
  }

  save(key: string, json: string) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;

    try {
      localStorage.setItem(key, json);
    } catch(e) {
      console.log("Error saving to local storage. " + e)
    }
  }

  loadOccasions(cb: () => mixed): void {
    const savedOccasions = this.load("occasions")

    if (savedOccasions) {
      this.setState({
        occasions: JSON.parse(savedOccasions),
        occasionsState: "success"
      }, cb);
    } else {
      fetch(`${API_ROOT}/occasions/`)
        .then(response => response.json())
        .then(occasionList => {
          const occasions = {};
          occasionList.forEach(o => {
            occasions[o.occasion.num] = o;
          })
          this.setState({occasions, occasionsState: "success"}, cb);
          this.save("occasions", JSON.stringify(occasions));
        })
        .catch(error => {
          // https://github.com/facebookincubator/create-react-app/issues/3482
          if (process.env.NODE_ENV !== 'test') {
            this.setState({
              occasions: {},
              occasionsState: "Error: " + error
            });
          }
        }
      );
    }
  }

  loadCategories(): void {
    const savedCategories = this.load("categories");

    if (savedCategories) {
      this.setState({
        categories: JSON.parse(savedCategories),
        categoriesState: "success"
      });
    } else {
      fetch(`${API_ROOT}/categories/`)
      .then(response => response.json())
      .then(categories => {
        this.setState({
          categories,
          categoriesState: "success"
        });
        this.save("categories", JSON.stringify(categories));
      })
      .catch(error => {
        console.log(error);
        this.setState({
          categoriesState: "error"
        });
      });
    }
  }

  loadPositions(womID: number): void {
    const addPositions = (womID, posData) => prevState => ({
      positions: Object.assign(
        {}, this.state.positions, { [womID]: posData })
    });

    const savedPositions = this.load("positions-" + womID);

    if (savedPositions) {
      this.setState(
        addPositions(womID, JSON.parse(savedPositions)),
        () => console.log("Finished loading position texts #" + womID)
      );
    } else {
      fetch(`${DATA_DIR}/WOM-${womID}.json`)
        .then(response => response.json())
        .then(respData => {
          const posData = {};
          respData.data.forEach(womData => {
            posData[womData.id] = womData.positions
          });
          this.setState(
            addPositions(womID, posData),
            () => console.log("Finished loading position texts #" + womID)
          );
          this.save("positions-" + womID, JSON.stringify(posData));
        })
        .catch(error => {
          console.log("Error loading position texts", error);
        });
    }
  }

  componentDidMount(): void {
    this.loadOccasions(() => this.loadCategories());
  }

  render() {
    const extraProps : RouteProps = {
      occasions: this.state.occasions,
      categories: this.state.categories,
      positions: this.state.positions,
      loadPositions: (womID: number) => this.loadPositions(womID)
    };

    return (
      <BrowserRouter>
        <div className="App">
          <HeaderMenu />
          <Container text style={{ marginTop: '7em' }}>
            <Route exact path="/" render={props => (
              <OccasionList {...props} {...extraProps} />
            )} />

            <Route path="/wahlen/:occasionNum/" render={props => (
              <Occasion {...props} {...extraProps} />
            )} />

            <Route exact path="/themen/" render={props => (
              <CategoriesList {...props} {...extraProps} />
            )} />

            <Route path="/themen/:category/" render={props => (
              <Category {...props} {...extraProps} />
            )} />
          </Container>
          <Footer />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
