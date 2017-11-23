import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';
import { Link } from 'react-router-dom';

export default class Category extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = this.makeStateFromProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.makeStateFromProps(nextProps));
  }

  extractThesisID(thesisID) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  makeStateFromProps(props) {
    const category = this.props.match.params.category;
    let theses = [];
    if (props.categories && props.categories[category] && props.occasions) {
      theses = props.categories[category].map(thesisID => {
        const {womID, thesisNUM} = this.extractThesisID(thesisID);
        const thesisData = props.occasions[womID].theses[thesisNUM];
        const positions = this.props.positions[womID]
          ? this.props.positions[womID][thesisID] : thesisData.positions;
        return Object.assign({}, thesisData, { womID, thesisNUM, positions });
      });
    }
    return { category, theses };
  }

  render() {
    const thesesElems = this.state.theses
      .sort((t1, t2) => t1.womID - t2.womID)
      .map(thesis => {
        return <div key={thesis.id}>
          <Thesis
            {...thesis}
            loaded={thesis.positions != null && thesis.positions.length > 0}
            showLink={true} />
        </div>;
      });

    return <div className="category">
      <h1><Link to="/themen/">Themen</Link> > {this.state.theses && this.state.theses.length > 0 ? this.props.match.params.category : <span>Loading...</span>}</h1>
      <ul className="theses">
        {thesesElems}
      </ul>
    </div>
  }
}
