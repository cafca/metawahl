// @flow

import React from 'react';
import autoBind from 'react-autobind';
import {
  Button,
  Input,
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

  handleSubmit(rating: number) {
    const uuid = loadFromCache('uuid');
    const endpoint = API_ROOT + "/react/objection";

    if (this.state.url.length === 0) {
      this.setState({error: "Bitte kopiere erst den Link zu deiner Quelle in das Eingabefeld oben."});
    } else if (this.state.error == null) {
      this.setState({ loading: true });
      const data = {
        uuid,
        rating,
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
    return <Segment raised color='blue' className="objectionForm" loading={this.state.loading}>
      <h3>Im Nachhinein</h3>

      <i
        onClick={this.props.handleCancel}
        aria-hidden="true"
        class="close icon closeIcon"></i>

      <p>Weißt du mehr darüber, wie nach der Wahl mit diesem Thema
        umgegangen wurde? Hat die gewählte Regierung sogar entgegen der
        Position gehandelt, die sie in diesem Wahl-o-Maten vertreten hat?
      </p>
      <p>
        Dann kannst du hier eine Quelle einreichen, über die sich andere
        Besucher dieser Seite darüber informieren können.
      </p>

      <p>
        <Input
          fluid
          label='Link zur Quelle'
          name='url'
          value={this.state.url}
          onChange={(e, { value }) => this.setState({url: value, error: null})}
          placeholder="https://internet.com/informationen/"
          type='text' />
      </p>

      {this.state.error !== null && this.state.error.length > 0 &&
        <Message negative>
          <p>{this.state.error}</p>
        </Message>
      }

      <Button.Group disabled={this.state.url.length === 0}>
        <Button positive onClick={() => this.handleSubmit(1)}>Eingehalten!</Button>
        <Button color='yellow' onClick={() => this.handleSubmit(0)}>Naja</Button>
        <Button negative onClick={() => this.handleSubmit(-1)}>Einwand!</Button>
      </Button.Group>

    </Segment>
  }
}
