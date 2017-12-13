// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import {
  Dropdown,
  Header,
  Icon,
  Label,
  Loader,
  Menu,
  Segment,
  Modal,
  Button
} from 'semantic-ui-react';

import { API_ROOT, makeJSONRequest } from './Config';
import Thesis, { categoryOptions, categoryNames } from './Thesis';
import type { TagType, ThesisType, RouteProps, ErrorState } from './Types';
import type { WikidataType } from './WikidataTagger';
import WikidataTagger from './WikidataTagger';

type State = {
  tag: ?TagType,
  theses: Array<ThesisType>,
  selectedCategory: ?string,
  selectedTag: ?WikidataType,
  confirmCategoryOpen: boolean,
  confirmTagOpen: boolean,
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
      selectedCategory: null,
      selectedTag: null,
      confirmTagOpen: false,
      confirmCategoryOpen: false,
      loading: false,
      tagState: "loading"
    }
  }

  componentDidMount() {
    this.loadTag();
  }

  handleCategorySelection(e: Event, { value }:{ value:string }) {
    this.setState({
      selectedCategory: value,
      confirmCategoryOpen: true
    });
  }

  handleCategoryChange(add: boolean) {
    if (this.state.selectedCategory == null) return;

    const endpoint = `${API_ROOT}/categories/${this.state.selectedCategory}`;
    const data = {};
    if (add === true) {
      data["add"] = this.state.theses.map(t => t.id);
    } else {
      data["remove"] = this.state.theses.map(t => t.id);
    }

    this.setState({
      loading: true,
      confirmCategoryOpen: false,
      selectedCategory: null
    });

    fetch(endpoint, makeJSONRequest(data))
      .then(response => response.json())
      .then(response => {
        console.log(response);
        this.setState({loading: false});
        this.loadTag();
      })
      .catch(error => {
        console.log(error);
        this.setState({loading: false});
      });
  }

  handleTagSelection(tagData: WikidataType) {
    this.setState({
      selectedTag: tagData,
      confirmTagOpen: true
    });
  }

  handleTagChange(add: boolean) {
    if (this.state.selectedTag == null) return;

    const tag: TagType = {
      title: this.state.selectedTag.label,
      description: this.state.selectedTag.description,
      url: this.state.selectedTag.concepturi,
      wikidata_id: this.state.selectedTag.id
    };

    this.setState({ loading: true, confirmTagOpen: false, selectedTag: null });

    const data = add ? {add: [tag, ]} : {remove: [tag, ]};
    const requests = this.state.theses.map(thesis =>
      fetch(
        `${API_ROOT}/thesis/${thesis.id}/tags/`,
        makeJSONRequest(data)
      )
    );

    Promise.all(requests)
      .then(responses => {
        responses.map(console.log);
        this.setState({loading: false});
        this.loadTag();
      })
      .catch((error: Error) => {
        // TODO: Error message
        console.log(error);
        this.setState({loading: false});
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
          tagState: "success"
        });
      })
      .catch((error: Error) => {
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== 'test') {
          console.log(error.message)
          this.setState({
            tag: null,
            theses: [],
            tagState: "error"
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
      <Loader active={this.state.tagState === "loading"} />

      {this.state.tag != null && this.state.tag.wikidata_id != null &&
        <Header as='h1' floated='right' style={{marginRight: "-10.5px"}}>
          <Label as='a' basic image href={this.state.tag.url} >
            <img src="/img/Wikidata-logo.svg" alt="Wikidata logo" /> {this.state.tag.wikidata_id}
          </Label>
        </Header>
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

      <Menu>
        <Dropdown
          item
          options={categoryOptions}
          onChange={this.handleCategorySelection}
          placeholder='Bereich für alle...'
          search
          selection
          selectOnNavigation={false}
          selectOnBlur={false}
          style={{border: "none"}}
          value={this.state.selectedCategory}
        />

        <Modal
          closeIcon={true}
          onClose={() => {this.setState({
            confirmCategoryOpen: false,
            selectedCategory: null
          })}}
          open={this.state.confirmCategoryOpen}
        >
          <Modal.Content>
            <p>Möchtest du die Kategorie "{categoryNames[this.state.selectedCategory]}" bei all diesen
              Thesen hinzufügen oder entfernen?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button basic color="red"
              onClick={() => this.handleCategoryChange(false)}>
              <Icon name='remove' /> Entfernen
            </Button>
            <Button basic color="green"
              onClick={() => this.handleCategoryChange(true)}>
              <Icon name='checkmark' /> Hinzufügen
            </Button>
          </Modal.Actions>
        </Modal>

        <Menu.Item onClick={() => {}}>
          <Icon name="remove" /> Tag löschen
        </Menu.Item>

        <Menu.Menu
          position='right'
          style={{borderLeft: "1px solid #ccc"}}
        >
          <WikidataTagger
            onSelection={this.handleTagSelection}
            text={"Tag für alle..."} />
        </Menu.Menu>

        { this.state.selectedTag != null &&
          <Modal
            closeIcon={true}
            onClose={() => {this.setState({
              confirmTagOpen: false,
              selectedTag: null
            })}}
            open={this.state.confirmTagOpen}
          >
            <Modal.Content>
              <p>Möchtest du das Tag "{this.state.selectedTag.title}" bei all diesen
                Thesen hinzufügen oder entfernen?</p>
            </Modal.Content>
            <Modal.Actions>
              <Button basic color="red"
                onClick={() => this.handleTagChange(false)}>
                <Icon name='remove' /> Entfernen
              </Button>
              <Button basic color="green"
                onClick={() => this.handleTagChange(true)}>
                <Icon name='checkmark' /> Hinzufügen
              </Button>
            </Modal.Actions>
          </Modal>
        }

      </Menu>

      { this.state.theses.length > 0 &&
        <div>
          {theses}
        </div>
      }
    </div>;
  }
};
