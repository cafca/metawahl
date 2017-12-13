// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';

import { API_ROOT, setTitle } from './Config';
import { loadFromCache, saveToCache } from './App';
import type { TagType, RouteProps, ErrorState } from './Types';

type State = {
  tags: Array<TagType>,
  tagsState: ErrorState
};

export default class TagList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    const savedTags = loadFromCache('taglist');
    this.state = {
      tags: savedTags != null ? JSON.parse(savedTags) : [],
      tagsState: savedTags != null ? "success" : "loading"
    }
  }

  componentDidMount() {
    this.loadTags();
    setTitle('Tags');
  }

  loadTags(): void {
    fetch(`${API_ROOT}/tags/`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          tags: response.data,
          tagsState: "success"
        });
        saveToCache('taglist', JSON.stringify(response.data));
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            tags: [],
            tagsState: "error"
          });
        }
      }
    );
  }

  render() {
    const sortTags = (tagA, tagB) => {
      return tagA.slug === tagB.slug
        ? 0
        : tagA.slug < tagB.slug ? -1 : 1;
    };
    const tags = this.state.tags
      .sort(sortTags)
      .map((tag, i) => <li key={"Tag-" + i}>
        <Link to={"/tags/" + tag.slug}>{tag.title}</Link>
      </li>);

    // TODO: Error message when loadin failed

    return <div className="tagList">
        <h1>Tags</h1>
        <div>
          <Loader active={this.state.tagsState === "loading"}
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
