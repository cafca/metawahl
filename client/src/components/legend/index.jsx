// @flow

import React from "react"

import { Table } from "semantic-ui-react"
import { COLOR_PALETTE, OPINION_COLORS } from "../../config/"

import "./Legend.css"

type Props = {
  text?: string,
  style?: any,
  showMissing?: boolean,
  showSmallParties?: boolean
}

const Legend = ({
  text,
  style,
  showMissing = false,
  showSmallParties = false
}: Props) => (
  <Table basic collapsing compact unstackable className="legend" style={style}>
    <Table.Body className="large-legend">
      <Table.Row>
        {text != null && (
          <Table.Cell>
            <p>{text}</p>
          </Table.Cell>
        )}
        <Table.Cell style={{ fontWeight: "normal" }}>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[2] }}>
            &nbsp;
          </div>{" "}
          Partei ist dafür
        </Table.Cell>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[1] }}>
            &nbsp;
          </div>{" "}
          neutral
        </Table.Cell>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[0] }}>
            &nbsp;
          </div>{" "}
          dagegen
        </Table.Cell>
        {(showMissing || showSmallParties) && (
          <Table.Cell>
            <div
              className="square"
              style={{ backgroundColor: OPINION_COLORS["missing"] }}
            >
              &nbsp;
            </div>{" "}
            {showMissing && showSmallParties
              ? "Nicht vertreten / Kleinparteien"
              : showMissing
                ? "Nicht vertreten"
                : showSmallParties
                  ? "Kleinparteien"
                  : ""}
          </Table.Cell>
        )}
      </Table.Row>
    </Table.Body>

    <Table.Body className="small-legend">
      <Table.Row>
        {text != null && (
          <Table.Cell>
            <p>{text}</p>
          </Table.Cell>
        )}
      </Table.Row>
      <Table.Row>
        <Table.Cell style={{ fontWeight: "normal" }}>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[2] }}>
            &nbsp;
          </div>{" "}
          Partei ist dafür
        </Table.Cell>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[1] }}>
            &nbsp;
          </div>{" "}
          neutral
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>
          <div className="square" style={{ backgroundColor: COLOR_PALETTE[0] }}>
            &nbsp;
          </div>{" "}
          dagegen
        </Table.Cell>
        {(showMissing || showSmallParties) && (
          <Table.Cell>
            <div
              className="square"
              style={{ backgroundColor: OPINION_COLORS["missing"] }}
            >
              &nbsp;
            </div>{" "}
            {showMissing && showSmallParties
              ? "Nicht vertreten / Kleinparteien"
              : showMissing
                ? "Nicht vertreten"
                : showSmallParties
                  ? "Kleinparteien"
                  : ""}
          </Table.Cell>
        )}
      </Table.Row>
    </Table.Body>
  </Table>
)

export default Legend
