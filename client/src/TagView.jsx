// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import {
  Header,
  Icon,
  Loader,
  Segment
} from 'semantic-ui-react';

import { API_ROOT, setTitle, IS_ADMIN } from './Config';
import Thesis from './Thesis';
import TagViewMenu from './TagViewMenu';
import {WikidataLabel, WikipediaLabel} from './DataLabel';

import type { TagType, ThesisType, OccasionType, RouteProps, ErrorState } from './Types';

type State = {
  tag: ?TagType,
  theses: Array<ThesisType>,
  occasions: { [occasionNum: number]: OccasionType},
  loading: boolean,
  tagState: ErrorState
};

export default class TagView extends Component<RouteProps, State> {
  slug: string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.slug = this.props.match.params.tag;
    this.state = {
      tag: null,
      theses: [],
      occasions: {},
      loading: false,
      tagState: "loading"
    }
  }

  componentDidMount() {
    this.loadTag();
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
    const theses = this.state.tagState === "success" && this.state.theses.sort().map(
      (thesis, i) => <Thesis
        key={"Thesis-" + i}
        occasion={this.state.occasions[thesis.occasion_id]}
        linkOccasion={true}
        {...thesis} />
    );

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

      { this.state.tag != null && this.state.tag.aliases != null
          && this.state.tag.aliases.length > 0 &&
        <Segment>
          Auch: {this.state.tag.aliases.map(a => <span key={`alias-${a}`}>{a}, </span>)}
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
          {theses}
        </div>
      }
    </div>;
  }
};
