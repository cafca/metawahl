import React, { Component } from 'react';
import autoBind from 'react-autobind';
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';

import OccasionList from './OccasionList';
import Occasion from './Occasion';
import CategoriesList from './CategoriesList';
import Category from './Category';

const DATA_DIR = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "/data" : "/tamolhaw/data";

const Navbar = props => <div className="navbar">
  <a
    onClick={() => props.navigate("Wahlen")}
    style={{color: (props.page === "Wahlen" ? "red" : "white")}}>Wahlen</a>
  <a
    onClick={() => props.navigate("Themen")}
    style={{color: (props.page === "Themen" ? "red" : "white")}}>Themen</a>
</div>;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "Wahlen",
      instance: null,
      occasionsState: "loading",
      occasions: [],
      categoriesState: "loading",
      categories: {}
    }
    autoBind(this);
  }

  navigate(page, instance=null) {
    console.log("Navigate to " + page + " " + instance)
    this.setState({page, instance}, () => {window.scrollTo(0, 0);});
  }

  loadOccasions() {
    fetch(`${DATA_DIR}/data/occasions.json`)
      .then(response => response.json())
      .then(occasions => {
        this.setState({occasions, occasionsState: "success"});
      })
      .catch(error => {
        this.setState({
          occasionsState: "error",
          error: error
        });
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

  loadPositionTexts() {
    _.range(43).forEach(womId => {
      fetch(`${DATA_DIR}/WOM-${womId}.json`)
        .then(response => response.json())
        .then(respData => {
          const posData = {};
          respData.data.forEach(womData => {
            posData[womData.id] = womData.positions
          });
          this.setState({
            positionTexts: Object.assign(
              {}, this.state.positionTexts, { [womId]: posData })
          }, () => console.log("Finished loading position texts #" + womId));
        })
        .catch(error => {
          console.log("Error loading position texts", error);
        });
    })
  }

  componentDidMount() {
    this.loadOccasions();
    this.loadCategories();
    this.loadPositionTexts();
  }

  render() {
    const childProps = {
      occasions: this.state.occasions,
      occasionsState: this.state.occasionsState,
      categories: this.state.categories,
      categoriesState: this.state.categoriesState,
      navigate: this.navigate
    };

    let content;
    if (this.state.page === "Wahlen") {
      content = <OccasionList {...childProps} />;
    } else if (this.state.page === "Wahl") {
      content = <Occasion
        instance={this.state.occasions.filter(o => o.occasion.num === this.state.instance)[0]}
        positionTexts={this.state.positionTexts[this.state.instance]}
        navigate={this.navigate} />;
    } else if (this.state.page == "Themen") {
      content = <CategoriesList {...childProps} />;
    } else {
      content = <Category
        instance={this.state.instance}
        positionTexts={this.state.positionTexts}
        {...childProps} />;
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Wahl-o-Meter Web</h1>
          <Navbar navigate={this.navigate} page={this.state.page} />
        </header>
        {content}
      </div>
    );
  }
}

export default App;
