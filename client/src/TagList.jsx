// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Segment, Loader } from 'semantic-ui-react';

import { API_ROOT } from './Config';
import Tag from './Tag';
import type { TagType, ThesisType, RouteProps, ErrorState } from './Types';

type State = {
  tags: Array<TagType>
};

export default class TagList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      tags: []
    }
  }

  componentDidMount() {
    this.loadTags();
  }

  loadTags(): void {
    fetch(`${API_ROOT}/tags/`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          tags: response.data
        });
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            tags: []
          });
        }
      }
    );
  }

  render() {
    const sortTags = (tagA, tagB) => {
      return tagA.title === tagB.title
        ? 0
        : tagA.title < tagB.title ? -1 : 1;
    };
    const tags = this.state.tags
      .sort(sortTags)
      .map((tag, i) => <li>
        <Link to={"/tags/" + tag.slug}>{tag.title}</Link>
      </li>);

    return <div className="tagList">
        <h1>Tags</h1>
        <div>
          <Loader active={this.state.tags.length == 0}
            inline='centered' />
          { tags.length > 0 &&
            <ul>
            {tags}
            </ul>
          }
        </div>
      </div>;
  }
};
