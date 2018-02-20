// @flow

import React from 'react';
import autoBind from 'react-autobind';
import Moment from 'moment';
import {
  Button, Comment, Header, Icon, Message, Popup
} from 'semantic-ui-react';

import { loadFromCache } from '../../app/';
import { API_ROOT, makeJSONRequest, OBJECTION_NAMES, OPINION_COLORS } from '../../config/';
import ObjectionForm from './form';
import ErrorHandler from '../../utils/errorHandler';

import type { ObjectionType, ErrorType } from '../../types/';

Moment.locale('de');

type Props = {
  id: string,
  occasionDate: string,
  objections: Array<ObjectionType>,
  voterOpinion: -1 | 0 | 1
};

type State = {
  objectionFormOpen: boolean,
  objections: Array<ObjectionType>,
  error?: ?string,
  reported: ?string
};

export default class Objections extends React.Component<Props, State> {
  handleError: ErrorType => any;

  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      objections: props.objections,
      objectionFormOpen: false,
      reported: null
    }

    this.handleError = ErrorHandler.bind(this);
  }

  handleNewObjection(objection: ObjectionType) {
    // Add new objections to the displayed list
    if (objection != null) {
      this.setState({
        objectionFormOpen: false,
        objections: this.state.objections.concat([ objection ])
      });
    }
  }

  handleObjectionVote(objection: ObjectionType, value: boolean) {
    const endpoint = `${API_ROOT}/react/objection-vote`;
    const data = {
      objection_id: objection.id,
      value,
      uuid: loadFromCache('uuid')
    };
    fetch(endpoint, makeJSONRequest(data))
      .then(resp => resp.json)
      .then(resp => {
        if(!this.handleError(resp)) {
          this.setState({
            reported: objection.id
          });
        }
      }).catch(this.handleError);
  }

  render() {
    const objectionElems = this.state.objections
      .sort((obj1, obj2) => {
        if (obj1.vote_count === obj2.vote_count) {
          return Moment(obj1.date).diff(obj2.date);
        } else {
          return obj1.vote_count > obj2.vote_count ? -1 : 1;
        }
      })
      .map(objection => {
        const a = document.createElement('a');
        a.href = objection.url;
        let host = a.hostname;

        if (host.startsWith("www.")) host = host.slice(4)

        const sendReport = () => this.state.reported !== objection.id
          && this.handleObjectionVote(objection, true)

        return <Comment key={"objection-" + objection.id}>
        <Comment.Content>
          <Comment.Author style={{
            display: 'inline-block',
            color: '#fcfcfc',
            padding: "2px 0.3em",
            marginBottom: "2px",
            backgroundColor: OPINION_COLORS[objection.rating.toString()]
            }}>
            {/* <Label as='span' circular empty style={{}} />  */}
            {OBJECTION_NAMES[this.props.voterOpinion][objection.rating + 1]}
          </Comment.Author>
          <Comment.Metadata style={{display: "inline"}}>
              Eingereicht {Moment(objection.date).fromNow()} –
              {Moment(this.props.occasionDate).toNow(true)} nach der Wahl
          </Comment.Metadata>
          <Comment.Text>
            <div><a href={objection.url} target="_blank">
              {objection.title || objection.url}
            </a></div>
            <div style={{color: "rgb(180, 180, 180)"}}>{host}</div>
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action active={this.state.reported === objection.id}
              onClick={sendReport} >

              <Icon name='warning sign' /> Melden
              { this.state.reported === objection.id &&
                <span style={{marginLeft: 5}}>
                  <Icon name='check' color='green' /> Danke für den Hinweis!
                    Wir werden diese Quelle und ihre Bewertung auf ihre
                    Sachlichkeit prüfen.
                </span>
              }
            </Comment.Action>
          </Comment.Actions>
        </Comment.Content>
      </Comment>;
      });

    return <div className="objections">
      {objectionElems.length === 0 && this.state.objectionFormOpen === false &&
        <Popup
          wide
          header="Im Nachhinein"
          content={"Hast du Informationen zur Umsetzung dieser These?"}
          trigger={
              <Button
                basic
                icon
                as='span'
                labelPosition='left'
                disabled={this.state.objectionFormOpen}
                onClick={() => this.setState({objectionFormOpen: true})}
                style={{marginTop: "1rem", color: "#333"}}>
                <Icon name='bullhorn' /> Und, was ist seit dem passiert?
              </Button>
          } />
        }

      {objectionElems.length > 0 &&
        <div className="objections">
          <Header as='h3' dividing style={{marginTop: "1rem", marginBottom: 10}}>
            Umsetzung
          </Header>

          <Comment.Group style={{marginTop: 0}}>
            {objectionElems}
          </Comment.Group>

          {this.state.objectionFormOpen === false &&
            <Popup
              wide
              header={"Quelle hinzufügen"}
              content={"Weißt du noch mehr zu einer geplanten oder erfolgten Umsetzung dieser These?"}
              trigger={
                  <Button
                    basic
                    icon
                    as='span'
                    labelPosition='left'
                    onClick={() => this.setState({objectionFormOpen: true})}
                    style={{color: "#333"}}>
                    <Icon name='bullhorn' /> Weißt du noch mehr zur Umsetzung?
                  </Button>
              } />
            }
        </div>
      }

      {this.state.objectionFormOpen &&
        <ObjectionForm
          thesis_id={this.props.id}
          voterOpinion={this.props.voterOpinion}
          handleSuccess={this.handleNewObjection}
          handleCancel={() => this.setState({objectionFormOpen: false})} />
      }

      { this.state.error != null &&
        <Message negative content={this.state.error} />
      }
    </div>
  }
}
