// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';
import type { TagType } from './WikidataTagger';

type Props = {
  data: TagType,
  remove: (string) => mixed
};

const Tag = ({ data, remove }: Props) => {
  return <Label
    key={data.title}
    as='a'
    tag
    onClick={() => {
      window.open(data.concepturi, "_blank")
    }}
    color='teal'
    style={{
      marginRight: ".4em",
      marginBottom: ".4em"
    }}
  >
    {data.label}
    <Icon name="delete"
      onClick={e => {
        e.stopPropagation();
        remove(data.title);
      }} />
  </Label>
};

export default Tag;
