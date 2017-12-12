// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import {
  Dropdown,
  Header,
  Icon,
  Label,
  Loader,
  Menu,
  Segment
} from 'semantic-ui-react';

import { API_ROOT, makeJSONRequest } from './Config';
import Thesis, { categoryOptions } from './Thesis';
import type { TagType, ThesisType, RouteProps, ErrorState } from './Types';
import type { WikidataType } from './WikidataTagger';
import WikidataTagger from './WikidataTagger';

type State = {
  tag: ?TagType,
  theses: Array<ThesisType>,
  selectedCategory: ?string,
  loading: boolean
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
      selectedCategory: null,
      loading: true
    }
  }

  componentDidMount() {
    this.loadTag();
  }

  handleCategorySelection(e: Event, { value }:{ value:string }) {
    this.setState({ selectedCategory: value})
  }

  handleCategoryChange(add: boolean) {
    if (this.state.selectedCategory == null) return;

    this.setState({loading: true});

    const endpoint = `${API_ROOT}/categories/${this.state.selectedCategory}`;
    const data = {};
    if (add == true) {
      data["add"] = this.state.theses.map(t => t.id);
    } else {
      data["remove"] = this.state.theses.map(t => t.id);
    }

    fetch(endpoint, makeJSONRequest(data))
      .then(response => response.json())
      .then(response => {
        console.log(response);
        this.loadTag();
      });
  }

  handleTag(tagData: WikidataType) {
    this.setState({ loading: true });

    const tag: TagType = {
      title: tagData.label,
      description: tagData.description,
      url: tagData.concepturi,
      wikidata_id: tagData.id
    };

    const theses = this.state.theses.map(t => t.id);
    const requests = this.state.theses.map(thesis =>
      fetch(
        `${API_ROOT}/thesis/${thesis.id}/tags/`,
        makeJSONRequest({add: [tag,]})
      )
    );

    Promise.all(requests).then(responses => {
      responses.map(console.log);
      this.loadTag();
    });
  }

  loadTag(): void {
    fetch(`${API_ROOT}/tags/${this.slug}`)
      .then(response => response.json())
      .then(response => {
        this.setState({
          tag: response.data,
          theses: response.theses,
          loading: false
        });
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            tag: null,
            theses: [],
            loading: false
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

      {this.state.tag != undefined && this.state.tag.wikidata_id != undefined &&
        <Header as='h1' floated='right'>
          <Label as='a' basic image href={this.state.tag.url} >
            <img src="/img/Wikidata-logo.svg" /> {this.state.tag.wikidata_id}
          </Label>
        </Header>
      }

      <Header as='h1' disabled={this.state.tag == undefined}>
        <Icon name='hashtag' />
        {this.state.tag != undefined &&
          <Header.Content>
              {this.state.tag.title}
              <Loader active={this.state.loading} inline={true} size="small"
                style={{marginLeft: "1em", marginBottom: "0.2em"}} />
              {this.state.tag.description != undefined &&
                <Header.Subheader>
                  {this.state.tag.description} <br />
                </Header.Subheader>
              }
          </Header.Content>
        }
      </Header>

      <Menu>
        <Dropdown
          item
          options={categoryOptions}
          onChange={this.handleCategorySelection}
          placeholder='Kategorie für alle...'
          search
          selection
          selectOnNavigation={false}
          selectOnBlur={false}
          style={{border: "none"}}
        />
        <Menu.Item onClick={() => this.handleCategoryChange(true)} disabled={this.state.selectedCategory == null}>
          Hinzufügen
        </Menu.Item>
        <Menu.Item onClick={() => this.handleCategoryChange(false)} disabled={this.state.selectedCategory == null}>
          Entfernen
        </Menu.Item>
        <Menu.Menu
          position='right'
          style={{borderLeft: "1px solid #ccc"}}
        >
          <WikidataTagger onSelection={this.handleTag} text={"Alle taggen..."} />
        </Menu.Menu>
      </Menu>

      { this.state.theses.length > 0 &&
        <div>
          {theses}
        </div>
      }
    </div>;
  }
};
