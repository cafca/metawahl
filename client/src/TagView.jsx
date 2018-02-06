// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import {
  Header,
  Icon,
  Loader,
  Pagination,
  Segment
} from 'semantic-ui-react';

import { API_ROOT, setTitle, IS_ADMIN, THESES_PER_PAGE } from './Config';
import Thesis from './Thesis';
import Tag from './Tag';
import TagViewMenu from './TagViewMenu';
import {WikidataLabel, WikipediaLabel} from './DataLabel';

import type { TagType, ThesisType, OccasionType, RouteProps, ErrorState } from './Types';

type State = {
  occasions: { [occasionNum: number]: OccasionType},
  loading: boolean,
  page: number,
  tag: ?TagType,
  tagState: ErrorState,
  theses: Array<ThesisType>
};

export default class TagView extends Component<RouteProps, State> {
  slug: string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.slug = this.props.match.params.tag;
    this.state = {
      loading: false,
      occasions: {},
      page: parseInt(this.props.match.params.page, 10) || 1,
      tag: null,
      tagState: "loading",
      theses: []
    }
  }

  componentDidMount() {
    this.loadTag();
  }

  handlePaginationChange(
    e: SyntheticInputEvent<HTMLInputElement>,
    { activePage }: { activePage: number }
  ) {
    this.setState({ page: activePage });
    this.props.history.push(
      "/tags/" + this.props.match.params.tag + "/" + activePage);
  }

  loadTag(): void {
    fetch(`${API_ROOT}/tags/${this.slug}`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          tag: response.data,
          theses: response.theses,
          occasions: response.occasions,
          tagState: "success",
          loading: false
        });
        setTitle("#" + response.data.title);
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            tag: null,
            theses: [],
            occasions: {},
            tagState: "error",
            loading: false
          });
        }
      }
    );
  }

  render() {
    const startPos = (this.state.page - 1) * THESES_PER_PAGE;
    const endPos = startPos + THESES_PER_PAGE;

    const theses = this.state.tagState === "success" && this.state.theses
      .sort((t1, t2) => t2.occasion_id - t1.occasion_id)
      .slice(startPos, endPos)
      .map((thesis, i) =>
        <Thesis
          key={"Thesis-" + i}
          occasion={this.state.occasions[thesis.occasion_id]}
          linkOccasion={true}
          {...thesis}
        />
      );

    const relatedTags = (this.state.tag && this.state.tag.related_tags) || {};
    const relatedTagsElems = Object.keys(relatedTags)
      .sort((a, b) => relatedTags[b].count - relatedTags[a].count)
      .map(i =>
        <Tag
          data={relatedTags[i].tag}
          detail={relatedTags[i].count}
          key={"Tag-" + relatedTags[i].tag}
        />)
      .slice(0, 10);

    return <div>
      <Loader active={this.state.tagState === "loading"} />

      {this.state.tag != null && this.state.tag.wikidata_id != null &&
        <WikidataLabel {...this.state.tag} style={{marginRight: "-10.5px"}} />
      }

      {this.state.tag != null && this.state.tag.wikipedia_title != null &&
        <WikipediaLabel {...this.state.tag} style={{marginRight: "-10.5px"}} />
      }

      <Header as='h1' disabled={this.state.tagState === "loading"}>
        <Icon name='hashtag' />
        {this.state.tag != null &&
          <Header.Content>
              {this.state.tag.title}
              <Loader active={this.state.loading} inline={true} size="small"
                style={{marginLeft: "1em", marginBottom: "0.2em"}} />
              {this.state.tag.description != null &&
                <Header.Subheader>
                  {this.state.tag.description} <br />
                </Header.Subheader>
              }
          </Header.Content>
        }

        {this.state.tagState === "error" && <h2>There was an error loading this page.</h2>}
      </Header>

      { this.state.tag != null &&
        <Segment>
          { this.state.tag.aliases != null && this.state.tag.aliases.length > 0 &&
            <div>
              Auch: {this.state.tag.aliases.map(a => <span key={`alias-${a}`}>{a}, </span>)}
            </div>
          }

          {relatedTagsElems.length > 0 &&
            <div>
              <p>Verwandte Tags:</p>
              <p>{relatedTagsElems}</p>
            </div>
          }
        </Segment>
      }

      { IS_ADMIN &&
        <TagViewMenu
          tag={this.state.tag}
          theses={this.state.theses}
          setLoading={(isLoading) => this.setState({loading: isLoading})}
          refresh={() => this.loadTag()}
        />
      }

      { this.state.theses.length > 0 &&
        <div>
          <h2>Alle {this.state.theses.length} Thesen zum Thema {this.state.tag.title}</h2>
          {theses}

          <Pagination
            activePage={this.state.page}
            onPageChange={this.handlePaginationChange}
            prevItem={null}
            nextItem={null}
            totalPages={Math.ceil(this.state.theses.length / THESES_PER_PAGE)}
          />
        </div>
      }
    </div>;
  }
};
