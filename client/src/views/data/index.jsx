// @flow

import React from "react";
import { Container, Header } from "semantic-ui-react";
import SEO from "../../components/seo/";

const DataOverview = () => {
  return (
    <Container>
      <SEO />
      <Header as="h1">
        Daten
        <Header.Subheader>
          API Dokumentation und Downloads für alle Datensätze
        </Header.Subheader>
      </Header>
      <p>
        Hier findest du bald eine Dokumentation der Metawahl-Datensätze, welche
        im JSON-Format unter dem Endpunkt{" "}
        https://api.metawahl.de/api/v1/ zur Verfügung stehen.
      </p>
    </Container>
  );
};

export default DataOverview;
