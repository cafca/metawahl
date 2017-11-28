import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import {
  BrowserRouter,
  Route,
  Link
} from 'react-router-dom'

import OccasionList from './OccasionList';
import Occasion from './Occasion';
import CategoriesList from './CategoriesList';
import Category from './Category';

// const DATA_DIR = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
//   ? "/data" : "/tamolhaw/data";

const DATA_DIR = "/data"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "Wahlen",
      instance: null,
      occasionsState: "loading",
      occasions: {},
      categoriesState: "loading",
      categories: {},
      positions: {}
    }
    autoBind(this);
  }

  navigate(page, instance=null) {
    console.log("Navigate to " + page + " " + instance)
    this.setState({page, instance}, () => {window.scrollTo(0, 0);});
  }

  load(key) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;

    let rv = null;
    try {
      rv = localStorage.getItem(key);
    } catch(e) {
      console.log("Error loading from local storage. " + e);
    }
    return rv;
  }

  save(key, json) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return;

    try {
      localStorage.setItem(key, json);
    } catch(e) {
      console.log("Error saving to local storage. " + e)
    }
  }

  loadOccasions(cb) {
    const savedOccasions = this.load("occasions")

    if (savedOccasions) {
      this.setState({
        occasions: JSON.parse(savedOccasions),
        occasionsState: "success"
      }, cb);
    } else {
      fetch(`${DATA_DIR}/occasions.json`)
        .then(response => response.json())
        .then(occasionList => {
          const occasions = {};
          occasionList.forEach(o => {
            occasions[o.occasion.num] = o;
          })
          this.setState({occasions, occasionsState: "success"}, cb);
          this.save("occasions", JSON.stringify(occasions));
        })
        this.setState({occasions, occasionsState: "success"});
      })
      .catch(error => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          this.setState({
            occasions: null,
            occasionsState: "error",
            error: error
          });
        }
      });
  }

  loadCategories() {
    const savedCategories = this.load("categories");

    if (savedCategories) {
      this.setState({
        categories: JSON.parse(savedCategories),
        categoriesState: "success"
      });
    } else {
      fetch(`${DATA_DIR}/categories.json`)
      .then(response => response.json())
      .then(categories => {
        this.setState({
          categories,
          categoriesState: "success"
        });
        this.save("categories", JSON.stringify(categories));
      })
      .catch(error => {
        this.setState({
          categoriesState: "error",
          error: error,
        });
      });
    }
  }

  loadPositions(womID) {
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

  componentDidMount() {
    this.loadOccasions(() => this.loadCategories());
  }

  render() {
    const extraProps = {
      occasions: this.state.occasions,
      categories: this.state.categories,
      positions: this.state.positions,
      loadPositions: womID => this.loadPositions(womID)
    };

    return (
      <BrowserRouter>
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">metawahl</h1>
            <div className="navbar">
              <Link to="/">Wahlen</Link>
              <Link to="/themen/">Themen</Link>
            </div>
          </header>

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

        </div>
      </BrowserRouter>
    );
  }
}

export default App;
