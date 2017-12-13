// @flow

import React from 'react';
import { Label, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { categoryNames } from './Thesis';

type Props = {
  categories: Array<string>,
  remove: (string) => mixed
};

const CategoryRibbon = ({ categories, remove }: Props) => {
  const categoryElems = categories.map(category => (
    <span style={{marginRight: "1em"}} key={category}>
    <Link to={"/bereiche/" + category + "/"} style={{color: "white"}}>
      {categoryNames[category]}
    </Link>
    <Icon name="delete" style={{cursor: "pointer"}}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        remove(category);
      }} />
    </span>
  ));

  return categoryElems.length > 0 &&
    <Label ribbon color='blue'>{categoryElems}</Label>;
}

export default CategoryRibbon;
