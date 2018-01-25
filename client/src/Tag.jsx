// @flow

import React from 'react';
import { Label, Icon, Popup } from 'semantic-ui-react';
import type { TagType } from './Types';

import { IS_ADMIN } from './Config';

type Props = {
  data: TagType,
  remove?: (string) => mixed,
  detail?: string | number
};

const Tag = ({ data, remove, detail }: Props) => {
  const labelElem = <Label
    basic
    key={data.wikidata_id}
    as='a'
    href={"/tags/" + data.slug}
    style={{
      marginRight: ".4em",
      marginBottom: ".4em",
      borderColor: "#2e34a3",
      color: "#2e34a3"
    }}
  >
    {data.title}
    { detail != null &&
      <Label.Detail style={{color: "#686CB2"}} as='span'>
        {detail}
      </Label.Detail>
    }
    { IS_ADMIN && remove !== null &&
      <Label.Detail>
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
        content={
          data.description.charAt(0).toUpperCase() + data.description.slice(1)
        }
        trigger={labelElem} />
    : labelElem;
};

export default Tag;
