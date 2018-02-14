// @flow

import React from 'react';

import { Container, Dropdown, Menu, Responsive } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import Search from './Search';

const HeaderMenu = (context: {}) => (
  <div>
    <Responsive minWidth={451}>
      <Menu fixed='top' inverted>
        <Container>
          <Menu.Item as={Link} to="/" header>
            Metawahl
          </Menu.Item>
          <Menu.Item as={Link} to='/'>Wahlen</Menu.Item>
          <Menu.Item as={Link} to='/bereiche/'>Bereiche</Menu.Item>
          <Menu.Item as={Link} to='/tags/'>Themen</Menu.Item>
          <Search {...context} />
        </Container>
      </Menu>
    </Responsive>
    <Responsive maxWidth={450}>
      <Menu inverted fluid>
        <Dropdown item text='Metawahl'>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/">Wahlen</Dropdown.Item>
            <Dropdown.Item as={Link} to="/bereiche/">Bereiche</Dropdown.Item>
            <Dropdown.Item as={Link} to="/tags/">Themen</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Search {...context} />
      </Menu>
    </Responsive>
  </div>
);

export default HeaderMenu;
