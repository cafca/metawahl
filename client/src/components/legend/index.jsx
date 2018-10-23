// @flow

import React from "react"

import { Table } from "semantic-ui-react"
import { COLOR_PALETTE, OPINION_COLORS } from "../../config/"

import "./Legend.css"

const Legend = ({ text, style }) => (
  <Table basic collapsing compact unstackable className="legend" style={style}>
    <Table.Body className='large-legend'>
      <Table.Row>
        {text != null && (
          <Table.Cell>
            <p>{text}</p>
          </Table.Cell>
        )}
        <Table.Cell style={{ fontWeight: "normal" }}>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[2] }}>&nbsp;</div> Dafür
        </Table.Cell>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[1] }}>&nbsp;</div> Neutral
        </Table.Cell>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[0] }}>&nbsp;</div> Dagegen
        </Table.Cell>
        <Table.Cell>
          <div
            className="square"
            style={{ backgroundColor: OPINION_COLORS["missing"] }}
          >&nbsp;</div> Nicht vertreten
        </Table.Cell>
      </Table.Row>
    </Table.Body>

    <Table.Body className='small-legend'>
      <Table.Row>
        {text != null && (
          <Table.Cell>
            <p>{text}</p>
          </Table.Cell>
        )}
      </Table.Row>
      <Table.Row>
        <Table.Cell style={{ fontWeight: "normal" }}>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[2] }}>&nbsp;</div> Dafür
        </Table.Cell>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[1] }}>&nbsp;</div> Neutral
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[0] }}>&nbsp;</div> Dagegen
        </Table.Cell>
        <Table.Cell>
          <div
            className="square"
            style={{ backgroundColor: OPINION_COLORS["missing"] }}
          >&nbsp;</div> Nicht vertreten
        </Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table>
)

export default Legend
