// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';
import type { CategoryType } from './Types';
import { CATEGORY_NAMES, CATEGORY_COLORS } from './Config';

type Props = {
  slug: string,
  remove: (string) => mixed
};

const CategoryLabel = ({ slug, remove }: Props) => {
  return <Label
    as='a'
    tag
    href={"/categories/" + slug}
    color={CATEGORY_COLORS[slug]}
    style={{
      marginRight: ".4em",
      marginBottom: ".4em"
    }}
  >
    {CATEGORY_NAMES[slug]}
    <Icon name="delete"
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        remove(slug);
      }} />
  </Label>
};

export default CategoryLabel;
