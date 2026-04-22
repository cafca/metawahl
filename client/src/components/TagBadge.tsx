import type { MouseEvent } from "react";

import { IS_ADMIN, COLOR_PALETTE } from "@/config";
import type { Tag } from "@/types/api";

type Props = {
  active?: boolean;
  data: Tag;
  remove?: (title: string) => void;
  detail?: string | number;
  onClick?: () => void;
};

export function TagBadge({ active, data, remove, detail, onClick }: Props) {
  const labelStyle = active
    ? {
        backgroundColor: COLOR_PALETTE[COLOR_PALETTE.length - 1],
        borderColor: COLOR_PALETTE[COLOR_PALETTE.length - 1],
        color: "white",
        marginRight: ".4em",
        marginBottom: ".4em",
      }
    : {
        marginRight: ".4em",
        marginBottom: ".4em",
      };

  const hasDescription =
    data.description != null && data.description.length > 0;
  const title = hasDescription ? data.description : undefined;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const href = onClick == null ? "/themen/" + data.slug + "/" : undefined;

  return (
    <a
      className="ui basic label"
      key={data.wikidata_id}
      href={href}
      onClick={handleClick}
      style={labelStyle}
      title={title}
    >
      # {data.title}
      {detail != null && <span className="detail">{detail}</span>}
      {IS_ADMIN && remove != null && (
        <span className="detail">
          <i
            className="delete icon"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              remove(data.title);
            }}
          />
        </span>
      )}
    </a>
  );
}

export default TagBadge;
