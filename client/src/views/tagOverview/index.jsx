// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Container,
  Header,
  Icon,
  List,
  Loader,
  Reveal,
  Grid
} from 'semantic-ui-react';

import { API_ROOT } from '../../config/';
import type { RouteProps } from '../../types/';
import SEO from '../../components/seo/';

import './TagOverview.css';


export default class TagList extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
  }

  render() {
    const sortByThesisCount = (tagA, tagB) => {
      return tagA.thesis_count === tagB.thesis_count
        ? tagA.slug < tagB.slug ? -1 : 1
        : tagA.thesis_count > tagB.thesis_count ? -1 : 1;
    };

    // Collect root tags first
    const rootTagNames = this.props.tags
      .filter(t => t.root === true)
      .sort(sortByThesisCount);

    const tagElems = rootTagNames
      .map((tag, i) => {
          const relatedTags = tag.related_tags.linked &&
            Object.keys(tag.related_tags.linked)
              .filter(k => rootTagNames.filter(t => t.title === k).length === 0)
              .map(k => Object.assign({}, tag.related_tags.linked[k].tag, { thesis_count: tag.related_tags.linked[k].count }))
              .sort(sortByThesisCount).slice(0, 5)
              .map((entry, j) => { return <List.Item key={i + '-' + j}>
                <List.Icon name='hashtag' />
                <List.Content><a href={'/themen/' + entry.slug + '/'}>{entry.title }</a></List.Content>
              </List.Item>})

          return <Grid.Column key={i} className='revealMe'>
          <Header as='h1' className='ellipsis'>
            <a href={'/themen/' + tag.slug + '/'}>{tag.title}</a>
          </Header>
            <div className='visible'>
                <p className='thesesCount' style={{fontFamily: "Roboto"}}>{tag.thesis_count}</p>
            </div>
            <div className='hidden'>
                <List>
                  {relatedTags}
                </List>
                <a href={'/themen/' + tag.slug + '/'}><Icon name='caret right' / > {tag.thesis_count} Thesen anschauen</a>
            </div>
          </Grid.Column>
        }
      );

      {/* TODO: Loading state this.props.isLoading */}

    return <Container className="tagList" style={{marginTop: "4em"}}>
      <SEO
        title='Metawahl: Alle Wahlthemen in Deutschland seit 2002' />
          <Loader active={this.props.isLoading} inline='centered' />

      <Grid relaxed divided doubling stackable columns={4}>
        <Grid.Column style={{width: "50%"}}>
          <Header as='h1' className='hyphenate'>Themenbereiche</Header>
          <p>Alle Thesen auf Metawahl sind mindestens einem von 600 Themen zugeordnet. Dadurch kannst du dir die Thesen
            zu jedem Thema übersichtlich auf einer Seite anschauen.
          </p>

          <p>
            Die Themenzuordnung ist ein laufender Prozess. Wenn du eine Idee für eine Ergänzung hast, kannst du
            bei jeder These unten rechts auf »melden« klicken, wir freuen uns über Vorschläge.
          </p>
          <p>
            <Icon name='caret right' /> <a href="/themenliste/">Alle 599 Thesen als Liste zeigen</a>
          </p>
        </Grid.Column>
        {tagElems}
      </Grid>
    </Container>;
  }
};
