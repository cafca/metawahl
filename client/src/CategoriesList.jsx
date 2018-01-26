// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { API_ROOT, setTitle, CATEGORY_COLORS } from './Config';
import { RouteProps, CategoryType } from './Types';
import { loadFromCache, saveToCache } from './App';
import {
  Breadcrumb,
  Button,
  Grid,
  Header,
  Icon,
  Label,
  Loader
} from 'semantic-ui-react';

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
        <li key={category.slug}>
          <Label circular style={{
            backgroundColor: CATEGORY_COLORS[category.slug],
            borderColor: CATEGORY_COLORS[category.slug],
            color: "#fff",
            marginLeft: -35}}>
            {category.theses.length}
          </Label>
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

        <Breadcrumb>
          <Breadcrumb.Section href="/bereiche/">Themenbereiche</Breadcrumb.Section>
        </Breadcrumb>

        <Header as='h1'>
          Themenbereiche
        </Header>

        <p>Hier finden sich die Thesen aus allen Wahl-o-Maten, sortiert nach
        dem Themenbereich der Bundesregierung, dem sie am ehesten zuzuordnen
        sind.</p>


        <Loader active={categories.length === 0} />

        <Grid stackable columns={2} className="categoryGrid">
          <Grid.Column>
            <ul>
              {categories.slice(0, parseInt(categories.length / 2, 10))}
            </ul>
          </Grid.Column>
          <Grid.Column>
            <ul>
              {categories.slice(parseInt(categories.length / 2, 10))}
            </ul>
          </Grid.Column>
        </Grid>

        <ul style={{listStyle: "none"}}>

        </ul>
      </div>;
  }
}

