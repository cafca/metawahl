// @flow

import React from 'react';
import { Label, Icon, Popup } from 'semantic-ui-react';
import type { TagType } from './Types';

import { IS_ADMIN, COLOR_PALETTE } from './Config';

type Props = {
  active?: boolean,
  data: TagType,
  remove?: (string) => mixed,
  detail?: string | number,
  onClick?: () => any
};

const Tag = ({ active, data, remove, detail, onClick }: Props) => {
  const labelElem = <Label
    basic
    key={data.wikidata_id}
    as='a'
    href={onClick == null ? "/themen/" + data.slug + '/' : null}
    onClick={onClick}
    style={active
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
    }}
  >
    # {data.title}
    { detail != null &&
      <Label.Detail as='span'>
        {detail}
      </Label.Detail>
    }
    { IS_ADMIN && remove !== null &&
      <Label.Detail as='span'>
        <Icon name="delete"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          remove && remove(data.title);
        }} />
      </Label.Detail>
    }
  </Label>;

  return data.description != null && data.description.length > 0
    ? <Popup
        content={data.description}
        trigger={labelElem} />
    : labelElem;
};

export default Tag;
