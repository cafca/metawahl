// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Header,
  Icon,
  Loader,
  Message,
  Pagination,
  Segment
} from 'semantic-ui-react';

import { API_ROOT, IS_ADMIN, THESES_PER_PAGE } from '../../config/';
import Errorhandler from '../../utils/errorHandler';
import Thesis from '../../components/thesis/';
import Tag from '../../components/tag/';
import { WikidataLabel, WikipediaLabel } from '../../components/label/DataLabel';
import SEO from '../../components/seo/';

import TagMenu from './menu';

import type {
  ErrorType, TagType, ThesisType, OccasionType, RouteProps
} from '../../types/';

type State = {
  occasions: { [occasionNum: number]: OccasionType},
  loading: boolean,
  page: number,
  slug: string,
  tag: TagType,
  theses: Array<ThesisType>
};

export default class TagView extends Component<RouteProps, State> {
  handleError: ErrorType => any;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      loading: true,
      page: parseInt(this.props.match.params.page, 10) || 1,
      slug: this.props.match.params.tag,
      tag: this.getCachedTag(),
      occasions: {},
      theses: []
    }

    this.handleError = Errorhandler.bind(this);
  }

  componentDidMount() {
    this.loadTag();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    const slug = nextProps.match.params.tag;
    const page = parseInt(nextProps.match.params.page, 10) || 1;

    if (slug !== this.state.slug) {
      this.setState({
        loading: true,
        page: page || 1,
        slug,
        tag: this.getCachedTag(slug),
        theses: [],
        occasions: {}
      }, this.loadTag);
    } else if (page !== this.state.page) {
      this.setState({
        page
      });
    }
  }

  getCachedTag(slugP?: string) {
    const slug = slugP || this.props.match.params.tag;
    return this.props.tags.filter(t => t.slug === slug).shift();
  }

  handlePaginationChange(
    e: SyntheticInputEvent<HTMLInputElement>,
    { activePage }: { activePage: number }
  ) {
    this.props.history.push("/themen/" + this.state.slug + "/" + activePage);
  }

  loadTag(): void {
    fetch(`${API_ROOT}/tags/${this.state.slug}`)
      .then(response => response.json())
      .then(response => {
        this.handleError(response);
        this.setState({
          tag: response.data,
          theses: response.theses,
          occasions: response.occasions,
          loading: false
        });
      })
      .catch((error: Error) => {
        this.handleError(error);
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log("Error decoding tag data: " + error.message);
          this.setState({
            loading: false,
            theses: [],
            occasions: {}
          });
        }
      }
    );
  }

  render() {
    const startPos = (this.state.page - 1) * THESES_PER_PAGE;
    const endPos = Math.min(
      startPos + THESES_PER_PAGE,
      this.state.theses.length
    );

    const theses = this.state.loading === false && this.state.theses
      .sort((t1, t2) => t2.occasion_id - t1.occasion_id)
      .slice(startPos, endPos)
      .map((thesis, i) =>
        <Thesis
          key={"Thesis-" + thesis.id}
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
          key={"RelTag-" + relatedTags[i].tag.title}
        />)
      .slice(0, 10);

    const pageTitle = this.state.tag != null && this.state.tag.title != null ?
      this.state.tag.title : null;

    return <div style={{minHeight: 350}} >
      <SEO
        title={'Metawahl: Wahlthema ' + pageTitle} />
      <Loader active={this.state.tag == null} />

      {this.state.tag != null && this.state.tag.wikidata_id != null &&
        <WikidataLabel {...this.state.tag} style={{marginRight: "-10.5px"}} />
      }

      {this.state.tag != null && this.state.tag.wikipedia_title != null &&
        <WikipediaLabel {...this.state.tag} style={{marginRight: "-10.5px"}} />
      }

      <Header as='h1' disabled={this.state.loading === false && this.state.tag == null}>
        <Icon name='hashtag' />
        { this.state.tag != null &&
          <Header.Content>
              {this.state.tag.title}
              {/* <Loader active={this.state.loading} inline={true} size="small"
                style={{marginLeft: "1em", marginBottom: "0.2em"}} /> */}
              {this.state.tag.description != null &&
                <Header.Subheader>
                  {this.state.tag.description} <br />
                </Header.Subheader>
              }
          </Header.Content>
        }
      </Header>

      { this.state.tag != null && (this.state.tag.aliases != null || relatedTagsElems.length > 0) &&
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

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }

      { IS_ADMIN &&
        <TagMenu
          tag={this.state.tag}
          theses={this.state.theses}
          setLoading={(isLoading) => this.setState({loading: isLoading})}
          refresh={() => this.loadTag()}
        />
      }

      <Loader active={this.state.loading} />

      { this.state.theses.length > 0 &&
        <div>
          <h2>Thesen {startPos + 1} bis {endPos} von insgesamt {this.state.theses.length}</h2>
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
