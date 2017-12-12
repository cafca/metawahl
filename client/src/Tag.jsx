// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';
import type { WikidataType } from './WikidataTagger';

type Props = {
  data: WikidataType,
  remove: (string) => mixed
};

const Tag = ({ data, remove }: Props) => {
  if (data.wikidata_id == null) {
    return <Label
      key={data.title}
      as='a'
      tag
      href={"/tags/" + data.slug}
      color='grey'
      style={{
        marginRight: ".4em",
        marginBottom: ".4em"
      }}
    >
      {data.title}
      <Icon name="delete"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          remove(data.title);
        }} />
    </Label>
  } else {
    return <Label
      key={data.wikidata_id}
      as='a'
      tag
      href={"/tags/" + data.slug}
      color='teal'
      style={{
        marginRight: ".4em",
        marginBottom: ".4em"
      }}
    >
      {data.title}
      <Icon name="delete"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          remove(data.title);
        }} />
    </Label>
  }
};

export default Tag;
