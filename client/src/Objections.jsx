// @flow

import React from 'react';
import autoBind from 'react-autobind';
import Moment from 'moment';
import {
  Button, Comment, Header, Icon, Label, Popup
} from 'semantic-ui-react';

import { OBJECTION_NAMES, OPINION_COLORS } from './Config';
import ObjectionForm from './ObjectionForm';

import type { ObjectionType } from './Types';

Moment.locale('de');

type Props = {
  id: string,
  occasionDate: string,
  objections: Array<ObjectionType>,
  voterOpinion: -1 | 0 | 1
};

type State = {
  objectionFormOpen: boolean,
  objections: Array<ObjectionType>
};

export default class Objections extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
    this.state = {
      objections: props.objections,
      objectionFormOpen: false
    }
  }

  handleNewObjection(objection: ObjectionType) {
    const objections1 = this.state.objections.slice();
    objections1.push(objection);
    this.setState({
      objectionFormOpen: false,
      objections: objections1
    });
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
        return <Comment key={"objection-" + objection.id}>
        <Comment.Content>
          <Comment.Author style={{display: 'inline-block'}}>
            <Label as='span' circular empty style={{backgroundColor: OPINION_COLORS[objection.rating.toString()]}} /> {OBJECTION_NAMES[this.props.voterOpinion][objection.rating + 1]}
          </Comment.Author>
          <Comment.Metadata>
              <span>Quelle eingereicht {Moment(objection.date).fromNow()} — </span>
              {Moment(this.props.occasionDate).toNow(true)} nach der Wahl
          </Comment.Metadata>
          <Comment.Text>
            <a href={objection.url} target="_blank">{objection.url}</a>
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action>Problematische Quelle melden</Comment.Action>
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
          <Header as='h3' dividing style={{marginTop: "2rem"}}>
            Umsetzung
          </Header>

          <Comment.Group>
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
    </div>
  }
}
