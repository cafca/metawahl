// @flow

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Container,
  Header,
  Icon,
  List,
  Loader,
  Grid
} from 'semantic-ui-react';

import type { RouteProps, TagType } from '../../types/';
import SEO from '../../components/seo/';

import './TagOverview.css';


export default class TagOverview extends Component<RouteProps> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
  }

  tagBySlug(slug: string): ?TagType {
    return this.props.tags
      .filter(t => t.slug === slug)
      .shift(1)
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
      .filter(t => t.thesis_count >= 10)
      .sort(sortByThesisCount);

    const tagElems = rootTagNames
      .map((tag, i) => {
        const relatedTags = tag.related_tags.linked &&
          Object.keys(tag.related_tags.linked)
            .filter(k => rootTagNames.filter(t => t.title === k).length === 0)
            .map(k => Object.assign(
              {},
              this.tagBySlug(tag.related_tags.linked[k].tag),
              { thesis_count: tag.related_tags.linked[k].count })
            )
            .sort(sortByThesisCount)
            .slice(0, 5)
            .map((entry, j) => <List.Item key={i + '-' + j}>
              <List.Icon name='hashtag' />
              <List.Content><a href={'/themen/' + entry.slug + '/'}>{entry.title }</a></List.Content>
            </List.Item>);

        return <Grid.Column key={i} className='revealMe'>
          <Header as='h1' className='ellipsis'>
            <a href={'/themen/' + tag.slug + '/'}>{tag.title}</a>
          </Header>
          <a href={'/themen/' + tag.slug + '/'}>
            <div className='visible'>
                <p className='thesesCount' style={{fontFamily: "Roboto"}}>{tag.thesis_count}</p>
            </div>
          </a>
          <div className='hidden'>
              <List>
                {relatedTags}
              </List>
              <a href={'/themen/' + tag.slug + '/'}>
                <Icon name='caret right' /> {tag.thesis_count} Thesen anschauen
              </a>
          </div>
        </Grid.Column>;
    });

    return <Container className="tagList">
      <SEO
        title='Metawahl: Alle Wahlthemen in Deutschland seit 2002' />

      <Grid relaxed divided doubling stackable padded columns={4}>
        <Grid.Row>
          <Grid.Column className="headerCount" width={4}>
            <div className='headerCountInner'>
              <div>600+</div>
              Themen
            </div>
          </Grid.Column>
          <Grid.Column width={12}>
            <p>
              Über die Zuordnung zu über 600 Themen kannst du hier entdecken, wie sich politische Positionen von Wählern – oder auch Parteien – über Zeit geändert haben, und wie sie sich zwischen den verschiedenen Gebieten, in denen gewählt wird, unterscheiden.
            </p>
            <p>
              Auf dieser Seite findest du einen Überblick der Themenbereiche. Hinter jedem von ihnen verstecken sich viele weitere Unterthemen. Jedes Thema ist dabei einem Eintrag auf Wikidata zugeordnet – einer Sammlung strukturierter Daten, die mit Wikipedia verknüpft ist.
            </p>

            <p>
              Die Themenzuordnung ist ein laufender Prozess. Wenn du eine Idee für eine Ergänzung hast, kannst du
              bei jeder These unten rechts auf »melden« klicken, wir freuen uns über Vorschläge.
            </p>
            <p>
              <Icon name='caret right' /> <a href="/themenliste/">Alle Themen als Liste zeigen</a>
            </p>
          </Grid.Column>
        </Grid.Row>

        { this.props.isLoading && <Grid.Row textAlign='center' style={{height: "10em"}}>
            <Loader active={this.props.isLoading} />
        </Grid.Row>
        }

        {tagElems}

        <Grid.Column>
          <Link to='/themenliste/'>
            <h1>... und viele mehr</h1>
            <p>Viele weitere Themen sind in dieser Übersicht nicht enthalten. Klicke hier, um sie dir als Liste anzuschauen.</p>
          </Link>
        </Grid.Column>
      </Grid>
    </Container>;
  }
};
