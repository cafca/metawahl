// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { API_ROOT, setTitle } from './Config';
import { RouteProps, CategoryType } from './Types';
import { loadFromCache, saveToCache } from './App';
import { Button, Icon, Header } from 'semantic-ui-react';

type State = {
  categories: Array<CategoryType>
};

export default class CategoriesList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    const savedCategories = loadFromCache('categorylist');
    this.state = {
      categories: savedCategories != null ? JSON.parse(savedCategories) : []
    }
    autoBind(this);
  }

  componentDidMount() {
    this.loadCategories();
    setTitle('Bereiche');
  }

  loadCategories() {
    const endpoint = `${API_ROOT}/categories/`;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.setState({
          categories: response.data
        });
        saveToCache('categorylist', JSON.stringify(response.data));
      });
  }

  render() {
    const sortCategories = (catA, catB) => {
      return catA.slug === catB.slug
        ? 0
        : catA.slug < catB.slug ? -1 : 1;
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
        <Button icon as='a' color='blue' basic floated="right"
          href={API_ROOT + '/categories.json?include_tag_ids=1'}
          labelPosition='left'>
          <Icon name='download' />
          categories.json
        </Button>

        <Header as='h1'>
          Themenbereiche
        </Header>

        <ul>
          {categories}
        </ul>
      </div>;
  }
}

