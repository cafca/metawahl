// @flow

import React from 'react';
import autoBind from 'react-autobind';
import {
  Button,
  Icon,
  Input,
  Message,
  Segment
} from 'semantic-ui-react';
import { makeJSONRequest, API_ROOT, OBJECTION_NAMES, COLOR_PALETTE } from './Config';
import { loadFromCache } from './App';

import type { ObjectionType } from './Types';

type Props = {
  thesis_id: string,
  handleSuccess: ObjectionType => any,
  handleCancel: () => any,
  voterOpinion: number
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
    const outerStyle = {
      margin: "2rem auto",
      borderColor: COLOR_PALETTE[0] +  " !important"
    };

    return <Segment raised color='blue' className="objectionForm"
      loading={this.state.loading} style={outerStyle}>
      <h3>Im Nachhinein</h3>

      <i
        onClick={this.props.handleCancel}
        aria-hidden="true"
        className="close icon closeIcon"></i>

      <p>Weißt du mehr darüber, wie nach der Wahl mit diesem Thema
        umgegangen wurde? Hat die eingesetzte Regierung so gehandelt, wie
        hier der Großteil der Wähler mit ihrer Stimme verlangt hat?
      </p>
      <p>
        Dann kannst du hier eine Quelle einreichen, über die sich andere
        Besucher dieser Seite darüber informieren können.
      </p>

      <Input
        fluid
        label='Link zur Quelle'
        name='url'
        value={this.state.url}
        onChange={(e, { value }) => this.setState({url: value, error: null})}
        placeholder="https://internet.com/informationen/"
        style={{marginBottom: "1rem"}}
        type='text' />

      {this.state.error !== null && this.state.error.length > 0 &&
        <Message negative>
          <p>{this.state.error}</p>
        </Message>
      }

      <Button.Group disabled={this.state.url.length === 0}>
        <Button icon positive={this.props.voterOpinion !== 0} onClick={() => this.handleSubmit(1)}>
          <Icon name='smile' /> {OBJECTION_NAMES[this.props.voterOpinion][2]}
        </Button>

        <Button icon color={this.props.voterOpinion === 0 ? null : 'yellow'} onClick={() => this.handleSubmit(0)}>
          <Icon name='meh' /> {OBJECTION_NAMES[this.props.voterOpinion][1]}
        </Button>

        <Button icon negative={this.props.voterOpinion !== 0} onClick={() => this.handleSubmit(-1)}>
          <Icon name='frown' /> {OBJECTION_NAMES[this.props.voterOpinion][0]}
        </Button>
      </Button.Group>
    </Segment>
  }
}
