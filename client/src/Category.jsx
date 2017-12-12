// @flow

import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Link } from 'react-router-dom';
import { categoryOptions } from './Thesis';
import { Menu, Dropdown } from 'semantic-ui-react';

import type { RouteProps, ThesisType } from './Types';

type State = {
  theses: Array<ThesisType>
};

export default class Category extends React.Component<RouteProps, State> {
  category : string;

  constructor(props: RouteProps) {
    super(props);
    autoBind(this);
    this.category = this.props.match.params.category;
    this.state = this.makeStateFromProps(this.props, true);
  }

  componentWillReceiveProps(nextProps: RouteProps) {
    this.setState(this.makeStateFromProps(nextProps, false));
  }

  extractThesisID(thesisID: string) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  makeStateFromProps(props: RouteProps, loadProps: boolean) {
    let theses = [];
    const positionsToLoad = new Set();
    if (props.categories && props.categories[this.category] && props.occasions) {
      theses = props.categories[this.category].map(thesisID => {
        const { womID, thesisNUM } = this.extractThesisID(thesisID);
        const thesisData : ThesisType = props.occasions[womID].theses[thesisNUM];

        let positions;
        if (this.props.positions[womID]) {
          positions = this.props.positions[womID][thesisID];
        } else {
          positions = thesisData.positions;
          positionsToLoad.add(womID)
        }

        return Object.assign({}, thesisData, { womID, thesisNUM, positions });
      });
    }
    if (loadProps) {
      positionsToLoad.forEach(this.props.loadPositions);
    }
    return { theses };
  }

  render() {
    const thesesElems = this.state.theses
      .sort((t1, t2) => t1.womID - t2.womID)
      .map(thesis => (
        <Thesis
          key={thesis.id}
          {...thesis}
          loaded={thesis.positions != null && thesis.positions.length > 0}
          showLink={true} />)
      );

    return <div className="category">
      <h1><Link to="/bereiche/">Themen</Link> > {this.state.theses && this.state.theses.length > 0 ? this.category : <span>Loading...</span>}</h1>
      <Menu>
        <Dropdown item placeholder='Kategorie für alle hinzufügen' style={{border: "none"}}
          search selection options={categoryOptions} />
        <Menu.Item onClick={() => {}}>
          Bestätigen
        </Menu.Item>
      </Menu>
      <div className="theses">
        {thesesElems}
      </div>
    </div>
  }
}
