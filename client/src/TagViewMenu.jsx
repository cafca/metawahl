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
import WikidataTagger from './WikidataTagger';

import type { TagType, ThesisType, RouteProps, ErrorState } from './Types';
import type { WikidataType } from './WikidataTagger';

type MenuProps = {
  tag: ?TagType,
  theses: Array<ThesisType>,
  setLoading: boolean => void,
  refresh: () => void
};

type MenuState = {
  selectedCategory: ?string,
  selectedTag: ?WikidataType,
  confirmCategoryOpen: boolean,
  confirmTagOpen: boolean,
};

export default class TagViewMenu extends Component<MenuProps, MenuState> {
  constructor(props: MenuProps) {
    super(props);
    autoBind(this);
    this.state = {
      selectedCategory: null,
      selectedTag: null,
      confirmTagOpen: false,
      confirmCategoryOpen: false
    }
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
      data["add"] = this.props.theses.map(t => t.id);
    } else {
      data["remove"] = this.props.theses.map(t => t.id);
    }

    this.props.setLoading(false);
    this.setState({
      confirmCategoryOpen: false,
      selectedCategory: null
    });

    fetch(endpoint, makeJSONRequest(data))
      .then(response => response.json())
      .then(response => {
        console.log(response);
        this.props.setLoading(false);
        this.props.refresh();
      })
      .catch(error => {
        console.log(error);
        this.props.setLoading(false);
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

    this.props.setLoading(true);
    this.setState({ confirmTagOpen: false, selectedTag: null });

    const data = add ? {add: [tag, ]} : {remove: [tag, ]};
    const requests = this.props.theses.map(thesis =>
      fetch(
        `${API_ROOT}/thesis/${thesis.id}/tags/`,
        makeJSONRequest(data)
      )
    );

    Promise.all(requests)
      .then(responses => {
        responses.map(console.log);
        this.props.setLoading(false);
        this.props.refresh();
      })
      .catch((error: Error) => {
        // TODO: Error message
        console.log(error);
        this.props.setLoading(false);
        this.props.refresh();
      });
  }

  render() {
    return <Menu>
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
  }
}
