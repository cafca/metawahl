// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import '../../index.css';
import { Link } from 'react-router-dom';
import { Breadcrumb, Grid, Header, List, Responsive } from 'semantic-ui-react';
import moment from 'moment';

import { TERRITORY_NAMES } from '../../config/';
import SEO from '../../components/seo/';
import MapComponent from '../../components/map/';

import { RouteProps } from '../../types/';

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

  componentWillReceiveProps(nextProps: RouteProps) {
    const slug = nextProps.match.params.territory;
    if(slug !== this.state.slug) {
      this.setState({ slug });
    }
  }

  render() {
    const territoryName = TERRITORY_NAMES[this.state.slug];

      const occasions = this.props.occasions[this.state.slug] == null ? null :
        this.props.occasions[this.state.slug]
          .sort((a, b) => a.date < b.date)
          .map(occasion => <List.Item key={occasion.id} as='a'
              href={`/wahlen/${occasion.territory}/${occasion.id}/`}
              className='occasionListItem'>
            <List.Header as='h3'>{moment(occasion.date).year()}</List.Header>
            <span style={{color: 'rgb(140, 140, 140)'}}>
              {occasion.title.slice(0, occasion.title.indexOf(' '))} vom {moment(occasion.date).format('LL')}
            </span>
          </List.Item>);

    return <div className="occasionList">
      <SEO
        title={'Metawahl: Alle Wahlthemen in ' + territoryName} />

      <Breadcrumb>
        <Breadcrumb.Section href="/wahlen/">Wahlen</Breadcrumb.Section>
        <Breadcrumb.Divider icon='right angle' />
        <Breadcrumb.Section href={`/wahlen/${this.state.slug}/`}>
          {territoryName}
        </Breadcrumb.Section>
      </Breadcrumb>

      <Header dividing as='h1'>
        <Link to={"/wahlen/" + this.state.slug + "/"}>Wahlen in {territoryName}</Link>
      </Header>

      <Grid columns='2'>
        <Responsive minWidth={601} className='four wide column'>
          <MapComponent territory={this.state.slug} style={{maxHeight: "10em"}} />
        </Responsive>

        <Responsive maxWidth={600} className='six wide column'>
          <MapComponent territory={this.state.slug} style={{maxHeight: "10em"}} />
        </Responsive>

        <Grid.Column width='10'>
          <List relaxed='very'>
            {occasions}
          </List>
        </Grid.Column>
      </Grid>
    </div>
  }
};
