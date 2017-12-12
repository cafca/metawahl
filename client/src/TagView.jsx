// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { Segment, Icon, Loader, Header } from 'semantic-ui-react';

import { API_ROOT } from './Config';
import Thesis from './Thesis';
import type { TagType, ThesisType, RouteProps, ErrorState } from './Types';

type State = {
  tag: ?TagType,
  theses: Array<ThesisType>
};

export default class TagList extends Component<RouteProps, State> {
  slug: string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.slug = this.props.match.params.tag;
    this.state = {
      tag: null,
      theses: []
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
          theses: response.theses
        });
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            tag: null,
            theses: []
          });
        }
      }
    );
  }

  render() {
    const theses = this.state.theses.sort().map(
      (thesis, i) => <Thesis key={"Thesis-" + i} {...thesis} />
    );

    return <div>
        <Loader active={this.state.tag == undefined} />

        {this.state.tag != undefined &&
          <Header as='h1'>
            <Icon name='hashtag' />
            <Header.Content>
              {this.state.tag.title}
              {this.state.tag.description != undefined &&
                <Header.Subheader>
                  {this.state.tag.description}
                </Header.Subheader>
              }
            </Header.Content>
          </Header>
        }

        { this.state.theses.length > 0 &&
          <div>
            {theses}
          </div>
        }
      </div>;
  }
};
