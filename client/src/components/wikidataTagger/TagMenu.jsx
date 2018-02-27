// @flow

import React, { Component } from 'react';
import { withRouter } from 'react-router'
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Icon,
  Menu,
  Modal,
  Button,
  Confirm
} from 'semantic-ui-react';

import {
  API_ROOT,
  makeJSONRequest,
  adminKey
} from '../../config/';
import WikidataTagger from '../../components/wikidataTagger/';

import type { TagType, ThesisType } from '../../types/';
import type { WikidataType } from '../../components/wikidataTagger/';

type Props = {
  tag: ?TagType,
  theses: Array<ThesisType>,
  setLoading: boolean => void,
  refresh: () => void,
  history: { push: string => mixed }
};

type State = {
  confirmTagOpen: boolean,
  selectedTag: ?WikidataType,
  tagRemoveOpen: boolean
};

class TagMenu extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      selectedTag: null,
      confirmTagOpen: false,
      tagRemoveOpen: false
    }
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
    data["admin_key"] = adminKey();
    const requests = this.props.theses.map(thesis =>
      fetch(
        `${API_ROOT}/thesis/${thesis.id}/tags/`,
        makeJSONRequest(data)
      )
      .catch((error: Error) =>
        console.log("Error changing tag: " + error.message))
    );

    Promise.all(requests)
      .then(responses => {
        responses.map(console.log);
        this.props.refresh();
      })
      .catch((error: Error) => {
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
        this.props.history.push("/themen/?removed=" + slug);
      })
      .catch(error => {
        console.log("Error removing tag: " + error);
      })
  }

  handleTagRemoveCancel() {
    this.setState({tagRemoveOpen: false});
  }

  render() {
    return <Menu>
      { this.props.tag != null &&
        <Menu.Item onClick={() => {this.setState({tagRemoveOpen: true})}}
            style={{color: "#999"}}>
          <Icon name="trash outline" /> Tag löschen
        </Menu.Item>
      }

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

export default withRouter(TagMenu);
