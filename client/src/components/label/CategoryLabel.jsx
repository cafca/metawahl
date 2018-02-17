// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';
import { CATEGORY_NAMES, CATEGORY_COLORS, IS_ADMIN } from '../../config/';

type Props = {
  slug: string,
  remove: (string) => mixed
};

const CategoryLabel = ({ slug, remove }: Props) => {
  return <Label
    as='a'
    basic
    href={"/bereiche/" + slug}
    style={{
      marginRight: ".4em",
      marginBottom: ".4em",
      borderColor: CATEGORY_COLORS[slug],
    }}
  >
    {CATEGORY_NAMES[slug]}
    { IS_ADMIN &&
      <Icon name="delete"
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          remove(slug);
        }} />
    }
  </Label>
};

export default CategoryLabel;
