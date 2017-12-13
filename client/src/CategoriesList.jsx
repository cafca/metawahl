// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { API_ROOT } from './Config';
import { RouteProps, CategoryType } from './Types';

type State = {
  categories: Array<CategoryType>
};

export default class CategoriesList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    const savedCategories = this.props.load('categorylist')
    this.state = {
      categories: savedCategories != null ? JSON.parse(savedCategories) : []
    }
    autoBind(this);
  }

  componentDidMount() {
    this.loadCategories();
  }

  loadCategories() {
    const endpoint = `${API_ROOT}/categories/`;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.setState({
          categories: response.data
        });
        this.props.save('categorylist', JSON.stringify(response.data));
      });
  }

  render() {
    const sortCategories = (catA, catB) => {
      return catA.name === catB.name
        ? 0
        : catA.name < catB.name ? -1 : 1;
    };

    const categories = this.state.categories
      .sort(sortCategories)
      .map(category => (
        <li key={category.name}>
          <Link to={`/bereiche/${category.slug}/`}>{category.name}</Link>
        </li>
      ));

    return this.props.categoriesState === "loading" ? <h2>Loading categories...</h2> :
      <div className="categories">
        <h1>Themenbereiche</h1>
        <ul>
          {categories}
        </ul>
      </div>;
  }
}

