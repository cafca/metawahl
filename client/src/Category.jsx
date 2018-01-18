// @flow

import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { API_ROOT, setTitle } from './Config';
import { loadFromCache } from './App';
import { Header, Loader, Breadcrumb } from 'semantic-ui-react';

import type { RouteProps, CategoryType } from './Types';

type State = (CategoryType & { occasions: {} }) | {};

export default class Category extends React.Component<RouteProps, State> {
  categorySlug : string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.categorySlug = props.match.params.category;
    this.state = {};
  }

  componentDidMount() {
    const savedCategories = loadFromCache('categorylist');
    if (savedCategories != null) this.setState(
      JSON.parse(savedCategories).filter(c => c.slug === this.categorySlug)[0]
    );
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
      .then(response => {
        this.setState(response.data);
        response.data && setTitle("- " + response.data.name);
      });
  }

  render() {
    const isCategoryFullyLoaded = Array.isArray(this.state.theses)
      && ( this.state.theses.length === 0
        || typeof this.state.theses[0] !== "string");

    const thesesElems = isCategoryFullyLoaded
      ? this.state.theses
        .sort((t1, t2) => t1.womID - t2.womID)
        .map(thesis => <Thesis
          key={thesis.id}
          occasion={this.state.occasions[thesis.occasion_id]}
          linkOccasion={true}
          {...thesis} />
        )
      : null;

    return <div className="category">
      <Breadcrumb>
        <Breadcrumb.Section href="/bereiche/">Themenbereiche</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        { this.state.name
          ? <Breadcrumb.Section active>
              {this.state.name}
            </Breadcrumb.Section>
          : <Breadcrumb.Section>Loading...</Breadcrumb.Section>
        }
      </Breadcrumb>
      <Header as='h1'>
        { this.state.name }
      </Header>
      <div className="theses">
        <Loader active={isCategoryFullyLoaded === false} inline='centered' />
        { thesesElems && thesesElems.length === 0 && <p>In diesem Bereich gibt es noch keine Thesen.</p> }
        {thesesElems}
      </div>
    </div>
  }
}
