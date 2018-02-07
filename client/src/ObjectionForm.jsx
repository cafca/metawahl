// @flow

import React from 'react';
import autoBind from 'react-autobind';
import {
  Button,
  Form,
  Message,
  Segment
} from 'semantic-ui-react';
import { makeJSONRequest, API_ROOT } from './Config';
import { loadFromCache } from './App';

import type { ObjectionType } from './Types';

type Props = {
  thesis_id: string,
  handleSuccess: ObjectionType => any,
  handleCancel: () => any
};

type State = {
  error: ?string,
  loading: boolean,
  url: string
}

type APIResponseType = {
  data?: ObjectionType,
  error?: string
};

export default class ObjectionForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      error: null,
      loading: false,
      url: ""
    };
  }

  handleChange(e: SyntheticInputEvent<HTMLInputElement>, { value }: { value: string }) {
    let error = null;

    if (value.length === 0)
      error = "Bitte kopiere den Link zu einer Quelle in das Textfeld";

    this.setState({ url: value, error: error });
  }

  handleSubmit(e: SyntheticInputEvent<HTMLInputElement>) {
    e.preventDefault();

    const uuid = loadFromCache('uuid');
    const endpoint = API_ROOT + "/react/objection";

    if (this.state.error == null) {
      this.setState({ loading: true });
      const data = {
        uuid,
        url: this.state.url,
        thesis_id: this.props.thesis_id
      };
      fetch(endpoint, makeJSONRequest(data))
        .then(resp => resp.json())
        .then((resp: APIResponseType) => {
          if (resp.error != null && resp.error.length > 0) {
            this.setState({ error: resp.error, loading: false });
          } else {
            this.props.handleSuccess(resp.data);
            this.setState({ loading: false });
          }
        })
    }
  }

  render() {
    return <Segment raised color='blue' className="objectionForm">
      <h3>Einwand einreichen</h3>
      <p>Weißt du mehr darüber, wie nach der Wahl mit diesem Thema
        umgegangen wurde? Hat die gewählte Regierung sogar entgegen der
        Position gehandelt, die sie in diesem Wahl-o-Maten vertreten hat?
      </p>
      <p>
        Dann kannst du hier eine Quelle einreichen, über die sich andere
        Besucher dieser Seite darüber informieren können. Dazu kopierst
        du einfach die Webadresse der Quelle hierher und klickst auf
        abschicken. Danke!
      </p>
      {this.state.error !== null && this.state.error.length > 0 &&
        <Message negative>
          <p>{this.state.error}</p>
        </Message>
      }
      <Form onSubmit={this.handleSubmit} loading={this.state.loading}>
        <Form.Input
          label='Link zur Quelle'
          name='url'
          value={this.state.value}
          onChange={(e, { value }) => this.setState({url: value, error: null})}
          placeholder="https://internet.com/informationen/"
          type='text' />
        <Form.Group>
          <Form.Button primary disabled={this.state.url.length === 0}>Abschicken</Form.Button>
          <Button onClick={this.props.handleCancel}>
            Abbrechen
          </Button>
        </Form.Group>
      </Form>
    </Segment>
  }
}
