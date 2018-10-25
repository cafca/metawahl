// @flow

import React from "react"

import { Table } from "semantic-ui-react"
import { COLOR_PALETTE, OPINION_COLORS } from "../../config/"

import "./Legend.css"

type Props = {
  text?: string,
  style?: any,
  preliminary: boolean,
  showMissing: boolean
}

const Legend = ({ text, style, preliminary, showMissing }: Props) => (
  <div>
    <Table
      basic
      collapsing
      compact
      unstackable
      style={style}
      className="legend large-legend"
    >
      <Table.Body >
        <Table.Row>
          {text != null && (
            <Table.Cell>
              <p>{text}</p>
            </Table.Cell>
          )}
          <Table.Cell style={{ fontWeight: "normal" }}>
            <div
              className="square"
              style={{ backgroundColor: COLOR_PALETTE[2] }}
            >
              &nbsp;
            </div>{" "}
            Partei {preliminary ? "ist" : "war"} dafür
          </Table.Cell>
          <Table.Cell>
            <div
              className="square"
              style={{ backgroundColor: COLOR_PALETTE[1] }}
            >
              &nbsp;
            </div>{" "}
            neutral
          </Table.Cell>
          <Table.Cell>
            <div
              className="square"
              style={{ backgroundColor: COLOR_PALETTE[0] }}
            >
              &nbsp;
            </div>{" "}
            dagegen
          </Table.Cell>
          {(preliminary || showMissing) && (
            <Table.Cell>
              <div
                className="square"
                style={{ backgroundColor: OPINION_COLORS["missing"] }}
              >
                &nbsp;
              </div>{" "}
              {showMissing
                ? "nicht im Wahl-o-Mat"
                : preliminary
                  ? "Kleinparteien"
                  : ""}
            </Table.Cell>
          )}
        </Table.Row>
      </Table.Body>
    </Table>
    <Table
      basic
      unstackable
      className="legend small-legend"
      style={style}
      columns={(preliminary || showMissing) ? 4 : 3}
    >
      <Table.Body>
        <Table.Row>
          <Table.Cell style={{ backgroundColor: COLOR_PALETTE[2] }}>
            Partei dafür
          </Table.Cell>
          <Table.Cell style={{ backgroundColor: COLOR_PALETTE[1] }}>
            neutral
          </Table.Cell>
          <Table.Cell style={{ backgroundColor: COLOR_PALETTE[0] }}>
            dagegen
          </Table.Cell>
          {(preliminary || showMissing) && (
            <Table.Cell style={{ backgroundColor: OPINION_COLORS["missing"] }}>
              {showMissing
                ? "nicht im W-o-M"
                : preliminary
                  ? "Kleinparteien"
                  : ""}
            </Table.Cell>
          )}
        </Table.Row>
      </Table.Body>
    </Table>
  </div>
)

export default Legend
