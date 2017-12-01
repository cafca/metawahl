import React from 'react';
import { Label, Icon } from 'semantic-ui-react';

const CategoryRibbon = ({ categories, remove }) => {
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
