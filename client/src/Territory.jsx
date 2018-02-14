// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import { Link } from 'react-router-dom';
import { Segment, Breadcrumb, Header } from 'semantic-ui-react';

import { setTitle, TERRITORY_NAMES } from './Config';
import { RouteProps } from './Types';

type State = {
  slug: string
};

export default class Territory extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      slug: this.props.match.params.territory
    };
  }

  componentDidMount() {
    this.setTitle();
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    const slug = nextProps.match.params.territory;
    if(slug !== this.state.slug) {
      this.setState({ slug }, this.setTitle);
    }
  }

  setTitle() {
    setTitle(TERRITORY_NAMES[this.state.slug]);
  }

  render() {
    const territoryName = TERRITORY_NAMES[this.state.slug];

    const occasions = this.props.occasions[this.state.slug] == null ? null :
      this.props.occasions[this.state.slug]
      .sort((a, b) => a.title > b.title)
      .map(occasion => <Segment key={occasion.id}>
          <Link to={`/wahlen/${occasion.territory}/${occasion.id}/`}>
            {occasion.title}
          </Link>
        </Segment>
      );

    return <div className="occasionList">
        <Breadcrumb>
          <Breadcrumb.Section href="/">Wahlen</Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section href={`/wahlen/${this.state.slug}/`}>
            {territoryName}
          </Breadcrumb.Section>
        </Breadcrumb>

        <Header as='h1'>
          {territoryName}
        </Header>

        <Segment.Group>
            {occasions}
        </Segment.Group>
      </div>;
  }
};
