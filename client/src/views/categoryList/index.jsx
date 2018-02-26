// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import { Link } from 'react-router-dom';

import '../../index.css';
import { RouteProps } from '../../types/';
import { Container, Grid, Header, Label, Loader } from 'semantic-ui-react';
import SEO from '../../components/seo/';


export default class CategoriesList extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
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
          <span style={{width: "2.5em", display: "inline-block"}}>
            <Label circular>
              {category.thesis_count}
            </Label>
          </span>

          <Link to={`/bereiche/${category.slug}/`}>{category.name}</Link>
        </li>
      ));

    return <Container id="outerContainer">
      <SEO title='Metawahl: Politik und Wahlkampf in Deutschland nach Themenbereichen'
        description='Die Thesen aus allen Wahl-o-Maten, sortiert nach
            dem ihnen nächstliegenden Themenbereich' />

      { this.props.categories.length === 0
      ? <h2>Lade Themenbereiche...</h2>
      : <Container className="categories">
        <Header as='h1' style={{paddingBottom: "1em"}}>
          Themenbereiche
          <Header.Subheader>
            Die Thesen aus allen Wahl-o-Maten, sortiert nach
            dem ihnen nächstliegenden Arbeitsbereich des Bundestages.
          </Header.Subheader>
        </Header>

        <Loader active={categories.length === 0} />

        <Grid stackable columns={2} style={{padding: "2em auto"}}>
          <Grid.Column>
            <ul style={{listStyle: "none", paddingLeft: "1em"}}>
              {categories.slice(0, parseInt(categories.length / 2, 10))}
            </ul>
          </Grid.Column>

          <Grid.Column>
            <ul style={{listStyle: "none", paddingLeft: "1em"}}>
              {categories.slice(parseInt(categories.length / 2, 10))}
            </ul>
          </Grid.Column>
        </Grid>
      </Container>
    }</Container>;
  }
}

