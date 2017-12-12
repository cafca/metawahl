// @flow

import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Link } from 'react-router-dom';
import { API_ROOT } from './Config';

import type { RouteProps, CategoryType } from './Types';

type State = CategoryType | {};

export default class Category extends React.Component<RouteProps, State> {
  categorySlug : string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.categorySlug = this.props.match.params.category;
    this.state = {};
  }

  componentDidMount() {
    this.loadCategory();
  }

  extractThesisID(thesisID: string) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  loadCategory() {
    const endpoint = `${API_ROOT}/categories/${this.categorySlug}`;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => this.setState(response.data));
  }

  render() {
    const thesesElems = this.state.theses != null && this.state.theses
      .sort((t1, t2) => t1.womID - t2.womID)
      .map(thesis => <Thesis key={thesis.id} {...thesis} />);

    return <div className="category">
      <h1><Link to="/bereiche/">Themen</Link> > {this.state.name ? this.state.name : <span>Loading...</span>}</h1>
      <div className="theses">
        { thesesElems.length === 0 && <p>In diesem Bereich gibt es noch keine Thesen.</p> }
        {thesesElems}
      </div>
    </div>
  }
}
