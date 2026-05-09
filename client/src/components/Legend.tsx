import type { CSSProperties } from "react";

import { COLOR_PALETTE, OPINION_COLORS } from "@/config";

import "./Legend.css";

type Props = {
  text?: string;
  style?: CSSProperties;
  preliminary: boolean;
  showMissing: boolean;
  genericVariation?: boolean;
};

export function Legend({
  text,
  style,
  preliminary,
  showMissing,
  genericVariation,
}: Props) {
  return (
    <div>
      <table
        className="ui basic collapsing compact unstackable table legend large-legend"
        style={style}
      >
        <tbody>
          <tr>
            {text != null && (
              <td>
                <p>{text}</p>
              </td>
            )}
            <td style={{ fontWeight: "normal" }}>
              <div
                className="square"
                style={{ backgroundColor: COLOR_PALETTE[2] }}
              >
                &nbsp;
              </div>{" "}
              {genericVariation === true
                ? "Dafür"
                : "Partei" + (preliminary ? " ist " : " war ") + "dafür"}
            </td>
            <td>
              <div
                className="square"
                style={{ backgroundColor: COLOR_PALETTE[1] }}
              >
                &nbsp;
              </div>{" "}
              {genericVariation === true ? "Neutral" : "neutral"}
            </td>
            <td>
              <div
                className="square"
                style={{ backgroundColor: COLOR_PALETTE[0] }}
              >
                &nbsp;
              </div>{" "}
              {genericVariation === true ? "Dagegen" : "dagegen"}
            </td>
            {(preliminary || showMissing) && (
              <td>
                <div
                  className="square"
                  style={{ backgroundColor: OPINION_COLORS["missing"] }}
                >
                  &nbsp;
                </div>{" "}
                {showMissing
                  ? genericVariation
                    ? "Partei nicht im Wahl-o-Mat"
                    : "nicht im Wahl-o-Mat"
                  : preliminary
                    ? "Kleinparteien"
                    : ""}
              </td>
            )}
          </tr>
        </tbody>
      </table>
      <table
        className="ui basic unstackable table legend small-legend"
        style={style}
      >
        <tbody>
          <tr>
            <td style={{ backgroundColor: COLOR_PALETTE[2] }}>
              {genericVariation === true ? "Dafür" : "Partei dafür"}
            </td>
            <td style={{ backgroundColor: COLOR_PALETTE[1] }}>
              {genericVariation === true ? "Neutral" : "neutral"}
            </td>
            <td style={{ backgroundColor: COLOR_PALETTE[0] }}>
              {genericVariation === true ? "Dagegen" : "dagegen"}
            </td>
            {(preliminary || showMissing) && (
              <td style={{ backgroundColor: OPINION_COLORS["missing"] }}>
                {showMissing
                  ? "nicht im W-o-M"
                  : preliminary
                    ? "Kleinparteien"
                    : ""}
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Legend;
