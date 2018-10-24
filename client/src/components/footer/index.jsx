// @flow

import React from "react"
import {
  Container,
  Divider,
  Grid,
  Header,
  List,
  Segment
} from "semantic-ui-react"

import type { RouteProps } from "../../types/"
import { TERRITORY_NAMES } from "../../config/"

import { ReactComponent as BMBF } from "./logo-bmbf.svg"
import { ReactComponent as OKFN } from "./logo-okfn.svg"

const Footer = (props: RouteProps) => {
  const territorries = Object.keys(props.elections).map(o => (
    <List.Item as="a" key={"footer-link-" + o} href={`/wahlen/${o}/`}>
      {TERRITORY_NAMES[o]}
    </List.Item>
  ))

  const recentElections = Object.keys(props.elections)
    .map(o => props.elections[o])
    .reduce((prev, cur) => prev.concat(cur), [])
    .sort((a, b) => {
      return a.date < b.date ? 1 : -1
    })
    .slice(0, territorries.length)
    .map(o => (
      <List.Item
        key={"footer-link-" + o.id}
        as="a"
        href={"/wahlen/" + o.territory + "/" + o.id + "/"}
      >
        {o.title}
      </List.Item>
    ))

  return (
    <Segment
      inverted
      vertical
      style={{ margin: "5em 0em 0em", padding: "5em 0em" }}
    >
      <Container textAlign="center">
        <Grid divided inverted stackable columns={3}>
          <Grid.Row>
            <Grid.Column textAlign="left">
              <Header inverted as="h4" content="Letzte Wahlen" />
              <List link inverted>
                {recentElections}
              </List>
            </Grid.Column>
            <Grid.Column textAlign="left" className="ui inverted link list">
              <Header inverted as="h4" content="Über Metawahl" />
              <p>Metawahl — Was haben wir gewählt?</p>
              <p>
                Ein Projekt von{" "}
                <a className="item" href="http://vincentahrend.com/">
                  Vincent Ahrend
                </a>
              </p>
              <p>
                Mit Unterstützung von{" "}
                <a className="item" href="https://denk-nach-mcfly.de">
                  Hanno »friesenkiwi«
                </a>{" "}
                und{" "}
                <a
                  className="item"
                  href="https://github.com/gockelhahn/qual-o-mat-data"
                >
                  Felix Bolte »gockelhahn«
                </a>{" "}
                bei der Konzeptfindung und beim Crawlen, Parsen und Taggen der
                Daten.
              </p>
              <p>
                Mit dem Metawahl-Logo und gestalterischer Unterstützung von{" "}
                <a className="item" href="http://linastindt.de">
                  Lina Stindt
                </a>
                .
              </p>
              <p>
                Alle Fragen und Antworten aus dem Wahl-o-Mat © Bundeszentrale
                für politische Bildung. Auch wenn diese Daten hier ohne jegliche
                inhaltliche Modifikationen abgebildet werden sollen, kann es aus
                technischen Gründen zu Übertragunsfehlern gekommen sein. Solche
                bitten wir{" "}
                <a className="item" href="mailto:metawahl@vincentahrend.com">
                  per Email
                </a>{" "}
                zu melden.
              </p>

              <p style={{ margin: "2em auto" }}>
                Vollständiger Quellcode verfügbar auf{" "}
                <a className="item" href="https://github.com/ciex/metawahl">
                  Github
                </a>
              </p>

              <p>
                Ein{" "}
                <a className="item" href="https://prototypefund.de/">
                  Prototype Fund
                </a>{" "}
                Projekt
              </p>
              <p>
                <a href="https://bmbf.de/">
                  <BMBF
                    style={{ filter: "invert(100%) grayscale(100%)" }}
                    alt="gefördert von: Logo Bundesministerium für Bildung und Forschung"
                  />
                </a>
                <a href="https://okfn.de/">
                  <OKFN
                    style={{ filter: "invert(100%)" }}
                    alt="Logo Open Knowledge foundation"
                  />
                </a>
              </p>
            </Grid.Column>
            <Grid.Column textAlign="left">
              <Header inverted as="h4" content="Gebiete" />
              <List link inverted>
                {territorries}
              </List>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider inverted section />
        <List horizontal inverted divided link>
          <List.Item as="a" href="/sitemap">
            Sitemap
          </List.Item>
          <List.Item as="a" href="mailto:metawahl@vincentahrend.com">
            metawahl@vincentahrend.com
          </List.Item>
          <List.Item as="a" href="/legal">
            Impressum
          </List.Item>
          <List.Item as="a" href="/legal#privacy">
            Datenschutzerklärung
          </List.Item>
        </List>
      </Container>
    </Segment>
  )
}

export default Footer
