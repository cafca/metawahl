import React, { Component } from 'react';
import autoBind from 'react-autobind';
import logo from './logo.svg';
import './App.css';

import OccasionList from './OccasionList';
import Occasion from './Occasion';
import CategoriesList from './CategoriesList';
import Category from './Category';

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
    fetch("/data/occasions.json")
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
    fetch("/data/categories.json")
      .then(response => response.json())
      .then(categories => {
        this.setState({categories, categoriesState: "success"});
      })
      .catch(error => {
        this.setState({
          categoriesState: "error",
          error: error
        });
      });
  }

  componentDidMount() {
    this.loadOccasions();
    this.loadCategories();
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
      content = <Occasion instance={this.state.occasions.filter(o => o.occasion.num === this.state.instance)[0]} navigate={this.navigate} />;
    } else if (this.state.page == "Themen") {
      content = <CategoriesList {...childProps} />;
    } else {
      content = <Category instance={this.state.instance} {...childProps} />;
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
