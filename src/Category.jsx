import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
import Thesis from './Thesis';

export default class Category extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      theses: []
    }
  }

  componentDidMount() {
    this.updateTheses(this.props);
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateTheses(nextProps);
  }

  extractThesisID(thesisID) {
    const elems = thesisID.split("-");
    return {
      type: elems[0],
      womID: parseInt(elems[1], 10),
      thesisNUM: parseInt(elems[2], 10)
    }
  }

  updateTheses(props) {
    const theses = props.categoriesState === "success" && props.occasionsState === "success" && props.categories[props.instance]
      .map(thesisID => {
        const {womID, thesisNUM} = this.extractThesisID(thesisID);
        return props.occasions[womID].theses[thesisNUM];
      });
    if(theses && theses.length !== this.state.theses.length) this.setState({theses});
  }

  render() {
    // Can't sort with theses ids directly because e.g. "WOM-50-21" < "WOM-7-3".
    const thesisIdSorter = (t1, t2) => this.extractThesisID(t1.id).womID - this.extractThesisID(t2.id).womID
    const theses = this.state.theses
      .sort(thesisIdSorter)
      .map(thesis => {
        const {womID} = this.extractThesisID(thesis.id);
        const thesisExtended = Object.assign({}, thesis, { positions: this.props.positionTexts[womID][thesis.id]});
        return <div key={thesis.id}>
          <Thesis
            {...thesisExtended}
            loaded={thesisExtended.positions != null && thesisExtended.positions.length > 0}
            navigate={this.props.navigate}
            showLink={true} />
        </div>;
      });

    const loading = this.props.categoriesState === "success" && this.props.occasionsState === "success" ? null
      : <p>Loading...</p>

    return <div className="category">
      <h1><a onClick={() => this.props.navigate("Themen")}>Themen</a> > {this.props.instance}</h1>
      <ul className="theses">
        {loading}
        {theses}
      </ul>
    </div>
  }
}
