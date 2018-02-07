// @flow

import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Segment, Breadcrumb, Header } from 'semantic-ui-react';
import Moment from 'moment';

import { API_ROOT, setTitle, TERRITORY_NAMES } from './Config';
import { RouteProps, ThesisType, OccasionType, ErrorState } from './Types';
import { WikidataLabel, WikipediaLabel } from './DataLabel.jsx'

type State = {
  occasion: ?OccasionType,
  occasionState: ErrorState,
  theses: Array<ThesisType>
};

export default class Occasion extends React.Component<RouteProps, State> {
  territory: string;
  occasionNum: number;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.occasionNum = parseInt(this.props.match.params.occasionNum, 10);
    this.territory = this.props.match.params.territory;
    this.state =  {
      occasion: null,
      occasionState: "loading",
      theses: []
    }
  }

  componentDidMount() {
    this.loadOccasion(
      occasion => occasion != null && setTitle("- " + occasion.title));
  }

  extractThesisID(thesisID: string) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  loadOccasion(cb?: OccasionType => mixed) {
    const endpoint = `${API_ROOT}/occasions/${this.occasionNum}`;
    fetch(endpoint)
      .then(response => response.json())
      .then(response => {
        this.setState({
          occasion: response.data,
          theses: response.theses
        })
        if (cb != null) cb(response.data);
      })
      .catch((error: Error) => {
        console.log(error.message);
        this.setState({
          occasion: null,
          occasionState: "error"
        })
      })
  }

  render() {
    const thesesElems = this.state.theses.sort((a, b) => a.id > b.id ? 1 : -1).map(
      (t, i) => <Thesis
        key={t.id}
        occasion={this.state.occasion}
        {...t} />
    );

    return <div className="occasion">
      <Breadcrumb>
        <Breadcrumb.Section href="/">Wahlen</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        <Breadcrumb.Section href={`/wahlen/${this.territory}/`}>
          {TERRITORY_NAMES[this.territory]}
        </Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        { this.state.occasion == null
          ? <Breadcrumb.Section>Loading...</Breadcrumb.Section>
          : <Breadcrumb.Section active>
              {Moment(this.state.occasion.date).year()}
            </Breadcrumb.Section>
        }
      </Breadcrumb>

      <WikidataLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />
      <WikipediaLabel {...this.state.occasion} style={{marginRight: "-10.5px"}} />

      <Header as='h1'>
        { this.state.occasion == null ? " "
          : this.state.occasion.title}
      </Header>

      {this.state.occasion == null &&
      <Segment loading style={{ minHeight: 100 }}></Segment>
      }

      {this.state.occasion != null &&
      <div className="theses">
        {thesesElems}
      </div>
      }
    </div>;
  }
}
