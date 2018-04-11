// @flow

import React from 'react';

import { Table } from 'semantic-ui-react';
import { COLOR_PALETTE } from '../../config/';

import './Legend.css';

const Legend = () => <Table collapsing compact className='legend'>
  <Table.Body>
    <Table.Row>
      <Table.Cell>
        <p>Partei war im Wahl-o-Mat:</p>
      </Table.Cell>
      <Table.Cell style={{fontWeight: 'normal'}}>
        <div className='square' style={{backgroundColor: COLOR_PALETTE[2]}}>&nbsp;</div> Dafür
      </Table.Cell>
      <Table.Cell>
        <div className='square' style={{backgroundColor: COLOR_PALETTE[1]}}>&nbsp;</div> Neutral
      </Table.Cell>
      <Table.Cell>
        <div className='square' style={{backgroundColor: COLOR_PALETTE[0]}}>&nbsp;</div> Dagegen
      </Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>;

export default Legend;
