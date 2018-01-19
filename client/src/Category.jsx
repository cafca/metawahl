// @flow

import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import Tag from './Tag';
import { API_ROOT, setTitle, THESES_PER_PAGE } from './Config';
import { loadFromCache } from './App';
import { Header, Loader, Breadcrumb, Pagination, Segment } from 'semantic-ui-react';

import type { RouteProps, CategoryType } from './Types';

type State = (CategoryType & { occasions: {}, page: number }) | {page: number};

export default class Category extends React.Component<RouteProps, State> {
  categorySlug : string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.categorySlug = props.match.params.category;
    this.state = {
      page: this.props.match.params.page || 1
    };
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

  handlePaginationChange(
    e: SyntheticInputEvent<HTMLInputElement>,
    { activePage }: { activePage: number }
  ) {
    this.setState({ page: activePage });
    this.props.history.push(
      "/bereiche/" + this.props.match.params.category + "/" + activePage);
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

    const startPos = (this.state.page - 1) * THESES_PER_PAGE;
    const endPos = startPos + THESES_PER_PAGE;

    const thesesElems = isCategoryFullyLoaded
      ? this.state.theses
        .sort((t1, t2) => t2.occasion_id - t1.occasion_id)
        .slice(startPos, endPos)
        .map(thesis => <Thesis
          key={thesis.id}
          occasion={this.state.occasions[thesis.occasion_id]}
          linkOccasion={true}
          {...thesis} />
        )
      : null;

    const relatedTags = this.state.related_tags && Object.keys(this.state.related_tags)
      .sort((a, b) => this.state.related_tags[a].count < this.state.related_tags[a].count)
      .map(i =>
        <Tag
          data={this.state.related_tags[i].tag}
          key={"Tag-" + this.state.related_tags[i].title}
        />);

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
      <Segment>
        <p>Themen in diesem Bereich:</p>
        <p>
          {relatedTags}
        </p>
      </Segment>
      <div className="theses">
        <Loader active={isCategoryFullyLoaded === false} inline='centered' />
        { thesesElems && thesesElems.length === 0 && <p>In diesem Bereich gibt es noch keine Thesen.</p> }
        {thesesElems}

        { thesesElems && thesesElems.length > 0 &&
          <Pagination
            activePage={this.state.page}
            onPageChange={this.handlePaginationChange}
            prevItem={null}
            nextItem={null}
            totalPages={Math.ceil(this.state.theses.length / THESES_PER_PAGE)}
          />
        }
      </div>
    </div>
  }
}
