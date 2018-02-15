// @flow

import React from 'react';
import autoBind from 'react-autobind';

import './App.css';
import { API_ROOT, THESES_PER_PAGE } from './Config';
import Thesis from './Thesis';
import Tag from './Tag';
import { errorHandler } from './App';
import SEO from './SEO';

import {
  Breadcrumb, Header, Loader, Message, Pagination, Segment
} from 'semantic-ui-react';

import type { RouteProps, CategoryType, ErrorType } from './Types';

type State = {
  error?: ?string,
  category: CategoryType,
  page: number,
  slug: string,
  isLoading: boolean
};

export default class Category extends React.Component<RouteProps, State> {
  handleError: ErrorType => any;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      category: this.getCachedCategory(props.match.params.category),
      page: parseInt(props.match.params.page, 10) || 1,
      slug: props.match.params.category,
      isLoading: true
    };

    this.handleError = errorHandler.bind(this);
  }

  componentDidMount() {
    this.loadCategory();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    const newPage = parseInt(nextProps.match.params.page, 10) || 1;
    const newSlug = nextProps.match.params.category;

    if (newSlug !== this.state.slug) {
      this.setState({
        category: this.getCachedCategory(newSlug),
        page: newPage,
        slug: newSlug,
        isLoading: true
      }, this.loadCategory);

    } else if (newPage !== this.state.page) {
      this.setState({
        page: newPage
      });
    }
  }

  extractThesisID(thesisID: string) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  getCachedCategory(slugP?: string) {
    const slug = slugP || this.state.slug;
    return this.props.categories.filter(cat => cat.slug === slug).shift();
  }

  handlePaginationChange(
    e: SyntheticInputEvent<HTMLInputElement>,
    { activePage }: { activePage: number }
  ) {
    this.props.history.push(`/bereiche/${this.state.slug}/${activePage}/`);
  }

  loadCategory() {
    const endpoint = `${API_ROOT}/categories/${this.state.slug}`;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.handleError(response)
        this.setState({
          isLoading: false,
          category: response.data
        });
      })
      .catch(this.handleError);
  }

  render() {
    const cat = this.state.category || {};

    const startPos = (this.state.page - 1) * THESES_PER_PAGE;
    const endPos = Math.min(
      startPos + THESES_PER_PAGE,
      cat.theses && cat.theses.length
    );

    const isComplete = this.state.isLoading === false && this.state.error == null;

    const thesesElems = isComplete === false ? [] : cat.theses
        .sort((t1, t2) => t2.occasion_id - t1.occasion_id)
        .slice(startPos, endPos)
        .map(thesis => <Thesis
          key={thesis.id}
          occasion={cat.occasions[thesis.occasion_id]}
          linkOccasion={true}
          {...thesis} />
        );


    const relatedTags = isComplete && cat.related_tags != null &&
      Object.keys(cat.related_tags)
      .sort((a, b) => cat.related_tags[b].count - cat.related_tags[a].count)
      .map(title =>
        <Tag
          data={cat.related_tags[title].tag}
          detail={cat.related_tags[title].count}
          key={"Tag-" + title}
        />);

    return <div className="category">
      <SEO title={this.props.category.name}
        description={'Alle Wahlkampfthemen aus dem Bereich '
        + this.props.category.name} />

      <Breadcrumb>
        <Breadcrumb.Section href="/bereiche/">Bereiche</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        { this.state.isLoading
          ? <Breadcrumb.Section>Loading...</Breadcrumb.Section>
          : <Breadcrumb.Section active>
              {cat.name}
            </Breadcrumb.Section>
        }
      </Breadcrumb>
      <Header as='h1'>
        { cat.name }
      </Header>

      { relatedTags != null && relatedTags.length > 0 &&
        <Segment>
          <p>Themen in diesem Bereich:</p>
          <p>
            {relatedTags}
          </p>
        </Segment>
      }

      <div className="theses">
        <Loader active={this.state.isLoading} inline='centered' />

        { this.state.error != null &&
          <Message negative header='Upsi' content={this.state.error} />
        }

        { this.state.isLoading === false && thesesElems.length === 0 &&
          <p>In diesem Bereich gibt es noch keine Thesen.</p>
        }

        { thesesElems.length > 0 &&
          <Header size='medium'>
            Thesen {startPos + 1} bis {endPos} von {cat.theses.length}:
          </Header>
        }

        {thesesElems}

        { thesesElems.length > 0 &&
          <Pagination
            activePage={this.state.page}
            onPageChange={this.handlePaginationChange}
            prevItem={null}
            nextItem={null}
            totalPages={Math.ceil(cat.theses.length / THESES_PER_PAGE)}
          />
        }
      </div>
    </div>
  }
}
