// @flow

import React, { Component } from 'react';
import autoBind from 'react-autobind';
import '../../index.css';
import {
  Checkbox,
  Container,
  Header,
  Icon,
  Item,
  Loader,
  Menu,
  Segment
} from 'semantic-ui-react';

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

    return <Container id="outerContainer">
      <SEO
        title='Metawahl: Alle Wahlthemen in Deutschland seit 2002' />

      <Header as='h1'>
        <Icon name="hashtag" />
        <Header.Content>
          Alle Themen
        </Header.Content>
      </Header>

      <Menu attached="top" pointing>
        <Menu.Item
          name="alphabetisch"
          active={this.state.sortBy === "name"}
          onClick={() => this.sortBy("name")} />
        <Menu.Item
          name="nach Anzahl Thesen"
          active={this.state.sortBy === "count"}
          onClick={() => this.sortBy("count")} />
      </Menu>

      <Segment attached>
        <Loader active={this.props.isLoading} inline='centered' />
        { tagElems.length > 0 &&
            <Item.Group link className="divided">
              {tagElems}
            </Item.Group>
        }
      </Segment>

      <Segment attached='bottom'>
        <Checkbox
          label="Zeige auch Tags mit nur einer These"
          onChange={this.toggleSingleTags}
          toggle
          />
      </Segment>
    </Container>;
  }
};
