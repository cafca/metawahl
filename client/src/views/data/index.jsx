// @flow

import React from "react";
import { Container, Header } from "semantic-ui-react";
import SwaggerUI from "swagger-ui";

import SEO from "../../components/seo/";
import type { RouteProps } from '../../types'

import "./swagger-theme-material.css"

class DataOverview extends React.Component<RouteProps> {
  componentDidMount() {
    SwaggerUI({
      dom_id: "#swagger-ui",
      url: "/swagger.yaml"
    })
  }
  render() {
    return (
      <Container>
        <SEO />
        <div id="swagger-ui" />
      </Container>
    );
  }
}

export default DataOverview;
