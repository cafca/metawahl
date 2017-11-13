import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';

export default class CategoriesList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    const categories = Object.keys(this.props.categories).sort().map(category => (
      <li key={category}>
        <a onClick={() => this.props.navigate("Thema", category)}>
          {category}
        </a>
      </li>
    ));

    return this.props.categoriesState == "loading" ? <h2>Loading categories...</h2> :
      <div className="categories">
        <h1>Themen</h1>
        <ul>
          {categories}
        </ul>
      </div>;
  }
}

