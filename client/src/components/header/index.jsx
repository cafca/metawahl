// @flow

import React from 'react';

import { Container, Dropdown, Menu, Responsive } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import Search from '../search/';

import Logo from '-!svg-react-loader!../../logo.svg'; // eslint-disable-line import/no-webpack-loader-syntax

const HeaderMenu = (props: {}) => (
  <div>
    <Responsive minWidth={600}>
      <Menu>
        <Container>
          <Menu.Item as={Link} to="/" header>
            Metawahl
          </Menu.Item>
          <Menu.Item
            active={props.match.params.area === 'wahlen'} as={Link} to='/wahlen/'>
              Wahlen
          </Menu.Item>
          <Menu.Item
            active={props.match.params.area === 'themen'} as={Link} to='/themen/'>
                Themen
          </Menu.Item>

          <Search {...props} large className="small right aligned item" />

        </Container>
      </Menu>
    </Responsive>
    <Responsive maxWidth={600}>
      <Menu fluid>
        <Dropdown item text='Metawahl'>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/">Einführung</Dropdown.Item>
            <Dropdown.Item as={Link} to="/wahlen/">Wahlen</Dropdown.Item>
            <Dropdown.Item as={Link} to="/themen/">Themen</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Search {...props} large className="small right aligned item" />
      </Menu>
    </Responsive>
  </div>
);

export default HeaderMenu;
