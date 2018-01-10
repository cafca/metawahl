// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';
import type { TagType } from './Types';

type Props = {
  data: TagType,
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
      color='blue'
      style={{
        marginRight: ".4em",
        marginBottom: ".4em"
      }}
    >
      {data.title}
      <Label.Detail>
        <Icon name="delete"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          remove(data.title);
        }} />
      </Label.Detail>
    </Label>
  }
};

export default Tag;
