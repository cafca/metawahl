// @flow

import React from 'react';
import { Container, Menu } from 'semantic-ui-react'
import { Link } from 'react-router-dom';

const HeaderMenu = () => (
  <Menu fixed='top' inverted>
    <Container>
      <Menu.Item as={Link} to="/" header>
{/*        <Image
          size='mini'
          src='/logo.png'
          style={{ marginRight: '1.5em' }}
        />*/}
        Metawahl
      </Menu.Item>
      <Menu.Item as={Link} to='/'>Wahlen</Menu.Item>
      <Menu.Item as={Link} to='/bereiche/'>Bereiche</Menu.Item>
      <Menu.Item as={Link} to='/tags/'>Themen</Menu.Item>
    </Container>
</Menu>
);

export default HeaderMenu;
