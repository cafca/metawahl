// @flow

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Header } from 'semantic-ui-react';
import SEO from '../../components/seo/';

import Search from '../../components/search/';

import type { RouteProps } from '../../types/';

const NotFound = (props: RouteProps) => <Container>
  <SEO title='Metawahl: 404 Seite nicht gefunden' />
  <Header as='h1' content="Upsi! 🙄" />
  <p>Da ist wohl was schiefgegangen. Diese Seite gibt es nämlich gar nicht.</p>
  <p>Was nun? Vielleicht möchtest du auf die <Link to='/'>Startseite</Link>,
  oder du suchst einfach nach dem, was du hier erwartet hast:</p>
  <Container textAlign='center'>
    <Search {...props} textAlign='left' />
  </Container>
</Container>

export default NotFound;
