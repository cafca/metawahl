// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';

type Props = {
  categories: Array<string>,
  remove: (string) => mixed
};

const CategoryRibbon = ({ categories, remove }: Props) => {
  const categoryElems = categories.map(category => (
    <span style={{marginRight: "1em"}} key={category}>
      {category}
      <Icon name="delete"
        onClick={e => {
          e.stopPropagation();
          remove(category);
        }} />
    </span>
  ));

  return categoryElems.length > 0 &&
    <Label as='a' ribbon color='blue'>{categoryElems}</Label>;
}

export default CategoryRibbon;
