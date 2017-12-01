import React from 'react';
import { Label, Icon } from 'semantic-ui-react'

const Tag = ({ data, remove }) => {
  return <Label
    key={data.title}
    as='a'
    tag
    onClick={() => {
      window.open(data.concepturi, "_blank")
    }}
    color='teal'
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
