// @flow

import React, { Component } from "react"
import autoBind from "react-autobind"
import moment from "moment"
import "../../index.css"
import {
  Container,
  Dropdown,
  Header,
  Icon,
  Loader,
  Menu,
  Message,
  Pagination
} from "semantic-ui-react"

import {
  API_ROOT,
  IS_ADMIN,
  THESES_PER_PAGE,
  TERRITORY_NAMES
} from "../../config/"
import Errorhandler from "../../utils/errorHandler"
import Thesis from "../../components/thesis/"
import { WikidataLabel, WikipediaLabel } from "../../components/label/DataLabel"
import SEO from "../../components/seo/"
import TagMenu from "../../components/wikidataTagger/TagMenu"
import Legend from "../../components/legend/"
import Tag from "../../components/tag/"

import type {
  ErrorType,
  TagType,
  ThesisType,
  ElectionType,
  RouteProps
} from "../../types/"

type State = {
  elections: { [electionNum: number]: ElectionType },
  loading: boolean,
  page: number,
  slug: string,
  tagFilter: ?string,
  territoryFilter: ?string,
  territoryCounts: {},
  invertFilter: boolean,
  tag: TagType,
  theses: Array<ThesisType>
}

export default class TagView extends Component<RouteProps, State> {
  handleError: ErrorType => any

  constructor(props: RouteProps) {
    super(props)
    autoBind(this)
    this.state = {
      loading: true,
      page: parseInt(this.props.match.params.page, 10) || 1,
      slug: this.props.match.params.tag,
      tag: this.getCachedTag(),
      elections: {},
      theses: [],
      tagFilter: null,
      territoryFilter: null,
      territoryCounts: {},
      invertFilter: false
    }

    this.handleError = Errorhandler.bind(this)
  }

  componentDidMount() {
    this.loadTag()
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    const slug = nextProps.match.params.tag
    const page = parseInt(nextProps.match.params.page, 10) || 1

    if (slug !== this.state.slug) {
      this.setState(
        {
          loading: true,
          page: page || 1,
          slug,
          tag: this.getCachedTag(slug),
          theses: [],
          elections: {}
        },
        this.loadTag
      )
    } else if (page !== this.state.page) {
      this.setState({
        page
      })
    }
  }

  getCachedTag(slugP?: string) {
    const slug = slugP || this.props.match.params.tag
    return this.props.tags.filter(t => t.slug === slug).shift()
  }

  handlePaginationChange(
    e: SyntheticInputEvent<HTMLInputElement>,
    { activePage }: { activePage: number }
  ) {
    this.props.history.push("/themen/" + this.state.slug + "/" + activePage)
  }

  loadTag(): void {
    fetch(API_ROOT + "/tags/" + this.state.slug)
      .then(response => response.json())
      .then(response => {
        this.handleError(response)
        this.setState(
          {
            tag: response.data,
            theses: response.theses || [],
            elections: response.elections || {},
            loading: false
          },
          this.updateTerritoryCounts
        )
      })
      .catch((error: Error) => {
        this.handleError(error)
        // https://github.com/facebookincubator/create-react-app/issues/3482
        if (process.env.NODE_ENV !== "test") {
          console.log("Error decoding tag data: " + error.message)
          this.setState({
            loading: false,
            theses: [],
            elections: {}
          })
        }
      })
  }

  updateTerritoryCounts() {
    const territoryCounts = Object.assign({}, TERRITORY_NAMES)
    Object.keys(territoryCounts).forEach(k => (territoryCounts[k] = 0))
    this.state.theses
      .map(t => this.state.elections[t.election_id].territory)
      .forEach(k => (territoryCounts[k] += 1))
    this.setState({ territoryCounts })
  }

  render() {
    const electionDateById = Object.keys(this.props.elections)
      // Collect all elections into one array
      .reduce((acc, cur) => acc.concat(this.props.elections[cur]), [])
      // Extract date into an object keyed by election id
      .reduce((acc, cur) => {
        acc[cur.id] = cur.date
        return acc
      }, {})

    const theses =
      this.state.loading || this.state.error
        ? []
        : this.state.theses
            .filter(
              thesis =>
                this.state.tagFilter == null
                  ? true
                  : this.state.invertFilter === false
                    ? thesis.tags.filter(t => t.title === this.state.tagFilter)
                        .length > 0
                    : thesis.tags.filter(t => t.title === this.state.tagFilter)
                        .length === 0
            )
            .filter(
              thesis =>
                this.state.territoryFilter == null
                  ? true
                  : this.state.invertFilter === false
                    ? this.state.elections[thesis.election_id].territory ===
                      this.state.territoryFilter
                    : this.state.elections[thesis.election_id].territory !==
                      this.state.territoryFilter
            )
            .sort(
              (t1, t2) =>
                moment(electionDateById[t2.election_id]).isBefore(
                  moment(electionDateById[t1.election_id])
                )
                  ? -1
                  : 1
            )

    const startPos = (this.state.page - 1) * THESES_PER_PAGE
    const endPos = Math.min(startPos + THESES_PER_PAGE, theses.length)

    const thesesElems =
      this.state.loading || this.state.error
        ? null
        : theses
            .slice(startPos, endPos)
            .map((thesis, i) => (
              <Thesis
                key={"Thesis-" + thesis.id}
                election={this.state.elections[thesis.election_id]}
                linkElection={true}
                showHints={i === 0}
                {...thesis}
              />
            ))

    const parentTags =
      this.state.tag &&
      this.state.tag.related_tags &&
      this.state.tag.related_tags.parents &&
      Object.keys(this.state.tag.related_tags.parents).map(k => (
        <Tag key={k} data={this.state.tag.related_tags.parents[k].tag} />
      ))

    let linkedTags = {}
    if (this.state.tag && this.state.tag.related_tags && this.state.tag.related_tags.linked) {
      linkedTags = this.state.tag.related_tags.linked
    }

    const tagFilterOptions = Object.keys(linkedTags)
      .sort((a, b) => linkedTags[b].count - linkedTags[a].count)
      .map(i => ({
        key: i,
        text: linkedTags[i].tag.title + " (" + linkedTags[i].count + ")",
        value: i
      }))

    const territoryFilterOptions = Object.keys(this.state.territoryCounts).map(
      k => ({
        key: k,
        text: TERRITORY_NAMES[k] + " (" + this.state.territoryCounts[k] + ")",
        value: k
      })
    )

    const pageTitle =
      this.state.tag != null && this.state.tag.title != null
        ? this.state.tag.title
        : null

    return (
      <Container id="outerContainer" style={{ minHeight: 350 }}>
        <SEO
          title={"Metawahl: Wahlthema " + pageTitle}
          canonical={"/themen/" + this.state.slug + "/"}
        />

        <Loader active={this.state.tag == null} />

        {this.state.tag != null &&
          this.state.tag.wikidata_id != null && (
            <WikidataLabel
              {...this.state.tag}
              style={{ marginRight: "-10.5px" }}
            />
          )}

        {this.state.tag != null &&
          this.state.tag.wikipedia_title != null && (
            <WikipediaLabel
              {...this.state.tag}
              style={{ marginRight: "-10.5px" }}
            />
          )}

        <Header
          as="h1"
          disabled={this.state.loading === false && this.state.tag == null}
        >
          <Icon name="hashtag" />
          {this.state.tag != null && (
            <Header.Content>
              {this.state.tag.title}
              {/* <Loader active={this.state.loading} inline={true} size="small"
                style={{marginLeft: "1em", marginBottom: "0.2em"}} /> */}
              {(this.state.tag.description != null ||
                this.state.tag.aliases != null) && (
                <Header.Subheader>
                  {this.state.tag.description}
                  {this.state.tag.description != null &&
                    this.state.tag.aliases != null && <br />}
                  {this.state.tag.aliases != null && (
                    <span>
                      Auch:{" "}
                      {this.state.tag.aliases.map(a => (
                        <span key={`alias-${a}`}>{a}, </span>
                      ))}
                    </span>
                  )}
                </Header.Subheader>
              )}
            </Header.Content>
          )}
        </Header>

        {parentTags && parentTags.length > 0 && <h3>{parentTags} </h3>}

        {/* { tagFilterOptions.length > 0 && this.state.tagFilter == null && <Message>
        <Icon name='info circle' /> Benutze den Themenfilter um immer wieder auftauchende Fragen in diesem
        Thema zu entdecken.
      </Message> } */}

        {tagFilterOptions.length + Object.keys(territoryFilterOptions).length >
          0 && (
          <Menu stackable>
            <Menu.Item header content="Filter" />
            <Dropdown
              className="link item"
              placeholder="Nur mit Thema..."
              selection
              scrolling
              value={this.state.tagFilter}
              style={{ border: "none" }}
              selectOnBlur={false}
              closeOnBlur={true}
              options={tagFilterOptions}
              disabled={tagFilterOptions.length === 0}
              onChange={(e, data) => this.setState({ tagFilter: data.value })}
            />

            <Dropdown
              className="link item"
              placeholder="Nur Gebiet..."
              selection
              scrolling
              value={this.state.territoryFilter}
              style={{ border: "none" }}
              selectOnBlur={false}
              closeOnBlur={true}
              options={territoryFilterOptions}
              onChange={(e, data) =>
                this.setState({ territoryFilter: data.value })
              }
            />
            {(this.state.tagFilter != null ||
              this.state.territoryFilter != null) && (
              <Menu.Item
                active={this.state.invertFilter}
                onClick={() =>
                  this.setState({ invertFilter: !this.state.invertFilter })
                }
              >
                <Icon name="undo" /> Filter umkehren
              </Menu.Item>
            )}
            {(this.state.tagFilter != null ||
              this.state.territoryFilter != null) && (
              <Menu.Item
                onClick={() =>
                  this.setState({
                    tagFilter: null,
                    territoryFilter: null,
                    invertFilter: false
                  })
                }
              >
                <Icon name="close" /> Zurücksetzen
              </Menu.Item>
            )}
          </Menu>
        )}

        {IS_ADMIN && (
          <TagMenu
            tag={this.state.tag}
            theses={this.state.theses}
            setLoading={isLoading => this.setState({ loading: isLoading })}
            refresh={() => this.loadTag()}
          />
        )}

        {this.state.error != null && (
          <Message negative content={this.state.error} />
        )}

        <Loader active={this.state.loading} />

        {theses.length > 0 && (
          <div style={{ marginTop: "3em" }}>
            {theses.length > THESES_PER_PAGE && (
              <h2 style={{ float: "right" }}>Seite {this.state.page}</h2>
            )}

            <h2>
              {theses.length} These
              {theses.length !== 1 && "n"} zu #{this.state.tag.title}
              {this.state.tagFilter != null && (
                <span>
                  {" "}
                  und {this.state.invertFilter && <em>nicht </em>}#
                  {this.state.tagFilter}
                </span>
              )}
              {this.state.territoryFilter != null && (
                <span>
                  {this.state.invertFilter === true
                    ? " außerhalb von Wahlen für "
                    : " in Wahlen für "}
                  {TERRITORY_NAMES[this.state.territoryFilter]}
                </span>
              )}
            </h2>

            <Legend text="Legende:" genericVariation={true} />

            <div style={{ marginTop: "1.5em" }}>{thesesElems}</div>

            <Pagination
              activePage={this.state.page}
              onPageChange={this.handlePaginationChange}
              prevItem={null}
              nextItem={null}
              totalPages={Math.ceil(theses.length / THESES_PER_PAGE)}
            />
          </div>
        )}
      </Container>
    )
  }
}
