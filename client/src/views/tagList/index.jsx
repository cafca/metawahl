// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Checkbox,
  Button,
  Header,
  Icon,
  Item,
  Loader,
  Menu,
  Segment
} from 'semantic-ui-react';

import { API_ROOT } from '../../config/';
import type { RouteProps } from '../../types/';
import SEO from '../../components/seo/';

type sorting = "count" | "name";

type State = {
  showSingleTags: boolean,
  sortBy: sorting
};

export default class TagList extends Component<RouteProps, State> {
  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.state = {
      showSingleTags: false,
      sortBy: "count"
    }
  }

  sortBy(method: sorting) {
    this.setState({sortBy: method});
  }

  toggleSingleTags(e: SyntheticInputEvent<HTMLInputElement>, { checked }: { checked: boolean }) {
    this.setState({showSingleTags: checked});
  }

  render() {
    // TODO: Protect against infinite recursion
    const sortByName = (tagA, tagB) => {
      return tagA.slug === tagB.slug
        ? sortByThesisCount(tagA, tagB)
        : tagA.slug < tagB.slug ? -1 : 1;
    };

    const sortByThesisCount = (tagA, tagB) => {
      return tagA.thesis_count === tagB.thesis_count
        ? sortByName(tagA, tagB)
        : tagA.thesis_count > tagB.thesis_count ? -1 : 1;
    };

    const tagElems = this.props.tags
      .filter(t => this.state.showSingleTags === true ? true : t.thesis_count > 1)
      .sort(this.state.sortBy === "name" ? sortByName : sortByThesisCount)
      .map((tag, i) => <Item key={"Tag-" + i} href={'/themen/' + tag.slug + '/'}>
        <Item.Content>
          <Item.Header>
            {tag.title}
            <span style={{color: "rgba(0,0,0,.4)"}}>
              &nbsp; {tag.thesis_count}
            </span>
          </Item.Header>
          { tag.description != null && tag.description.length > 0 &&
            <Item.Description>
              {tag.description}
            </Item.Description>
          }
        </Item.Content>
      </Item>);

    return <div className="tagList">
      <SEO
        title='Metawahl: Alle Wahlthemen in Deutschland seit 2002' />

        <Header as='h1'>
          <Icon name="hashtag" />
          <Header.Content>
            Themen
          </Header.Content>
        </Header>

        <p>Über die Zuordnung zu {this.props.isLoading ? 571 : this.props.tags.length} verschiedenen Themen
        kannst du hier die Wandlung politischer Positionen über die Grenzen einer
        einzelnen Wahl hinweg nachvollziehen.</p>

        <p>Durch Klick auf einen Eintrag der Liste unten gelangst du zu einer
        zeitlich sortierten Auflistung der dazugehörigen Thesen aus allen Wahl-o-Maten.</p>

        <p> Fast jedes dieser Themen ist dabei einem Artikel auf Wikipedia
        zugeordnet. So kannst du gleich nachlesen, was genau der Unterschied
        zwischen <a href="/themen/fluchtling">Flüchtlingen</a> und <a href="/themen/asylbewerber">Asylbewerbern</a> ist,
        was mit <a href="/themen/informationelle-selbstbestimmung">informationeller Selbstbestimmung</a> gemeint
        ist und was der <a href="/themen/verfassungsschutz">Verfassungsschutz</a> eigentlich
        für Aufgaben hat.</p>

        <Header as='h2' content='Alle Themen' />



        <Menu attached="top" pointing>
          <Menu.Item
            name="alphabetisch"
            active={this.state.sortBy === "name"}
            onClick={() => this.sortBy("name")} />
          <Menu.Item
            name="nach Anzahl Thesen"
            active={this.state.sortBy === "count"}
            onClick={() => this.sortBy("count")} />
          <Menu.Menu position='right'>
            <Menu.Item>
              <Button icon as='a' color='blue' basic floated="right"
                href={API_ROOT + '/tags.json?include_theses_ids=1'}
                labelPosition='left'>
                <Icon name='download' />
                tags.json
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <Segment attached="bottom">
          <Loader active={this.props.isLoading} inline='centered' />
          { tagElems.length > 0 &&
            <div>
              <Checkbox
                label="Zeige Tags mit nur einer These"
                onChange={this.toggleSingleTags}
                toggle
              />
              <Item.Group link className="divided">
                {tagElems}
              </Item.Group>
            </div>
          }
        </Segment>
      </div>;
  }
};