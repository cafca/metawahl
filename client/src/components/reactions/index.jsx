// @flow
import React from 'react';
import { Button, Header, Message } from 'semantic-ui-react';

import { API_ROOT, REACTION_NAMES, makeJSONRequest } from '../../config/';
import { ReactionsTallyType } from '../../types/';
import { loadFromCache, saveToCache } from '../../app/';
import ErrorHandler from '../../utils/errorHandler';

type Props = {
  id: string,
  reactions: ReactionsTallyType,
  handleSubmit: (kind: number) => any
};

type State = {
  submitted: ?number,
  error?: ?string
};

class Reactions extends React.Component<Props, State> {
  errorHandler: (resp: {}) => any;

  constructor(props) {
    super(props);
    const submittedReactions = JSON.parse(loadFromCache('userReactions') || "{}");
    this.state = {
      submitted: submittedReactions[props.id],
      reactions: props.reactions
    };
    this.handleError = ErrorHandler.bind(this);
  }

  handleClick(kind: number) {
    const data = {
      thesis_id: this.props.id,
      uuid: loadFromCache('uuid'),
      kind
    };
    const endpoint = API_ROOT + '/react/reaction';
    fetch(endpoint, makeJSONRequest(data))
      .then(resp => resp.json())
      .then(resp => {
        if (!this.handleError(resp)) {
          this.setState({
            submitted: kind,
            reactions: resp.data
          });
          const storedUserReactions = JSON.parse(
            loadFromCache('userReactions') || "{}"
          );
          saveToCache('userReactions', JSON.stringify(
            Object.assign({}, storedUserReactions, {[this.props.id]: kind})
          ));
        };
      });
  }

  render() {
    const buttons = Object.keys(REACTION_NAMES).map(k =>
      <Button basic onClick={() => this.handleClick(parseInt(k, 10))} key={k}
          className={this.state.submitted === parseInt(k, 10) ? 'active' : null}>
        <strong>{this.state.reactions[k]}</strong> {REACTION_NAMES[k]}
      </Button>
    );

    return <div style={{marginBottom: 10, marginTop: "1rem"}}>
      <Header as='h3' style={{marginTop: '1rem', marginBottom: 10, color: "rgb(60, 60, 60)"}}>
        Deine Reaktion?
      </Header>
      <Button.Group basic fluid className='stackable'>
        {buttons}
      </Button.Group>
      { this.state.error != null &&
        <Message negative header='Oh nein!' content={this.state.error} />
      }
    </div>
  }
}

export default Reactions;
