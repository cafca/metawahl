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

  loadOccasions() {
    fetch(`${DATA_DIR}/occasions.json`)
      .then(response => response.json())
      .then(occasionList => {
        const occasions = {};
        occasionList.forEach(o => {
          occasions[o.occasion.num] = o;
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
    fetch(`${DATA_DIR}/categories.json`)
      .then(response => response.json())
      .then(categories => {
        this.setState({
          categories,
          categoriesState: "success"
        });
      })
      .catch(error => {
        this.setState({
          categoriesState: "error",
          error: error,
        });
      });
  }

  loadPositions() {
    _.range(43).forEach(womId => {
      fetch(`${DATA_DIR}/WOM-${womId}.json`)
        .then(response => response.json())
        .then(respData => {
          const posData = {};
          respData.data.forEach(womData => {
            posData[womData.id] = womData.positions
          });
          this.setState(prevState => ({
            positions: Object.assign(
              {}, this.state.positions, { [womId]: posData })
          }), () => console.log("Finished loading position texts #" + womId));
        })
        .catch(error => {
          console.log("Error loading position texts", error);
        });
    })
  }

  componentDidMount() {
    this.loadOccasions();
    this.loadCategories();
    this.loadPositions();
  }

  render() {
    const extraProps = {
      occasions: this.state.occasions,
      categories: this.state.categories,
      positions: this.state.positions
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
