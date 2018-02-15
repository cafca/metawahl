// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Header, Icon } from 'semantic-ui-react';

import { setTitle, TERRITORY_NAMES } from './Config';
import { OccasionListType, RouteProps } from './Types';

type State = {
  occasions: OccasionListType
};

export default class OccasionList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      occasions: this.props.occasions
    };
  }

  componentDidMount() {
    setTitle();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    this.setState({
      occasions: nextProps.occasions
    });
  }

  render() {
    const occasions = this.state.occasions != null && Object.keys(this.state.occasions)
      .sort()
      .map(territory => {
        const occasions = this.state.occasions[territory]
          .sort((a, b) => a.date > b.date)
          .map(occasion => <Segment key={occasion.id}>
            <Link to={`/wahlen/${occasion.territory}/${occasion.id}/`}>
              {occasion.title}
            </Link>
          </Segment>);

        return <div className="territory" key={territory}>
          <h2><Link to={"/wahlen/" + territory + "/"}>{TERRITORY_NAMES[territory]}</Link></h2>
          <Segment.Group>
            {occasions}
          </Segment.Group>
        </div>;
      });

    return <div className="occasionList">
        <Header as='h1'>
          Alle Parlamente und Wahlen
          <Header.Subheader>
            Bundestags-, Landtags- und Europawahlen in der Übersicht
          </Header.Subheader>
        </Header>
        <div style={{paddingTop: "2em"}}>
          {occasions}
        </div>
      </div>;
  }
};
