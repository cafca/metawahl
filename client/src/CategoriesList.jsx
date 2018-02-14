// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { API_ROOT, setTitle } from './Config';
import { RouteProps } from './Types';
import {
  Breadcrumb,
  Button,
  Grid,
  Header,
  Icon,
  Label,
  Loader
} from 'semantic-ui-react';


export default class CategoriesList extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
  }

  componentDidMount() {
    setTitle('Bereiche');
  }

  render() {
    const sortCategories = (catA, catB) => {
      return catA.slug === catB.slug
        ? 0
        : catA.slug < catB.slug ? -1 : 1;
    };

    const categories = this.props.categories.length === 0 ? [] :
      this.props.categories
      .sort(sortCategories)
      .map(category => (
        <li key={category.slug}>
          { category.theses != null &&
            <Label circular>
              {category.theses.length}
            </Label>
          }
          <Link to={`/bereiche/${category.slug}/`}>{category.name}</Link>
        </li>
      ));

    return this.props.categories.length === 0 ? <h2>Lade Themenbereiche...</h2> :
      <div className="categories">
        <Button icon as='a' color='blue' basic floated="right"
          href={API_ROOT + '/categories.json?include_tag_ids=1'}
          labelPosition='left'>
          <Icon name='download' />
          categories.json
        </Button>

        <Breadcrumb>
          <Breadcrumb.Section href="/bereiche/">Bereiche</Breadcrumb.Section>
        </Breadcrumb>

        <Header as='h1'>
          Bereiche
        </Header>

        <p>Hier finden sich die Thesen aus allen Wahl-o-Maten, sortiert nach
        dem ihnen naheliegendsten Arbeitsbereich der Bundesregierung.</p>


        <Loader active={categories.length === 0} />

        <Grid stackable columns={2} className="categoryGrid">
          <Grid.Column>
            <ul style={{listStyle: "none"}}>
              {categories.slice(0, parseInt(categories.length / 2, 10))}
            </ul>
          </Grid.Column>

          <Grid.Column>
            <ul style={{listStyle: "none"}}>
              {categories.slice(parseInt(categories.length / 2, 10))}
            </ul>
          </Grid.Column>
        </Grid>
      </div>;
  }
}

