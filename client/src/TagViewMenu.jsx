// @flow

import React, { Component } from 'react';
import { withRouter } from 'react-router'
import autoBind from 'react-autobind';
import './App.css';
import {
  Dropdown,
  Icon,
  Menu,
  Modal,
  Button,
  Confirm
} from 'semantic-ui-react';

import {
  API_ROOT,
  CATEGORY_NAMES,
  categoryOptions,
  makeJSONRequest,
  adminKey
} from './Config';
import WikidataTagger from './WikidataTagger';

import type { TagType, ThesisType, ErrorState } from './Types';
import type { WikidataType } from './WikidataTagger';

type Props = {
  tag: ?TagType,
  theses: Array<ThesisType>,
  setLoading: boolean => void,
  refresh: () => void,
  history: { push: string => mixed }
};

type State = {
  confirmCategoryOpen: boolean,
  confirmTagOpen: boolean,
  selectedCategory: ?string,
  selectedTag: ?WikidataType,
  tagRemoveOpen: boolean
};

class TagViewMenu extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      selectedCategory: null,
      selectedTag: null,
      confirmTagOpen: false,
      confirmCategoryOpen: false,
      tagRemoveOpen: false
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

    data["admin_key"] = adminKey();

    this.props.setLoading(true);
    this.setState({
      confirmCategoryOpen: false,
      selectedCategory: null
    });

    fetch(endpoint, makeJSONRequest(data))
      .then(response => response.json())
      .then(response => {
        console.log(response);
        this.props.refresh();
      })
      .catch((error:ErrorState) => {
        console.log(error);
        this.props.refresh();
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

    const data = add ? {add: [tag, ]} : {remove: [tag.title, ]};
    const requests = this.props.theses.map(thesis =>
      fetch(
        `${API_ROOT}/thesis/${thesis.id}/tags/`,
        makeJSONRequest(data)
      )
    );

    Promise.all(requests)
      .then(responses => {
        responses.map(console.log);
        this.props.refresh();
      })
      .catch((error: Error) => {
        // TODO: Error message
        console.log(error);
        this.props.refresh();
      });
  }

  handleTagRemove() {
    if (this.props.tag == null) return;
    const slug = this.props.tag.slug;
    const endpoint = `${API_ROOT}/tags/${this.props.tag.slug}`;

    const requestData = {
      method: 'delete',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({admin_key: adminKey()})
    }

    fetch(endpoint, requestData)
      .then(response => {
        console.log(response);
        this.props.history.push("/tags/?removed=" + slug);
      })
      .catch(error => {
        // TODO: Show error message
        console.log(error);
      })
  }

  handleTagRemoveCancel() {
    this.setState({tagRemoveOpen: false});
  }

  render() {
    const categoryName = this.state.selectedCategory
      ? CATEGORY_NAMES[this.state.selectedCategory]
      : null;

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
          <p>Möchtest du die Kategorie "{categoryName}" bei all diesen
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

      <Menu.Item onClick={() => {this.setState({tagRemoveOpen: true})}} style={{color: "#999"}}>
        <Icon name="trash outline" /> Tag löschen
      </Menu.Item>

      <Confirm
        open={this.state.tagRemoveOpen}
        onCancel={this.handleTagRemoveCancel}
        onConfirm={this.handleTagRemove}
      />

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
            <p>Möchtest du das Tag "{this.state.selectedTag.label}" bei all diesen
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

export default withRouter(TagViewMenu);
