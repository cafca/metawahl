import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
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
      womID: parseInt(elems[1]),
      thesisNUM: parseInt(elems[2])
    }
  }

  updateTheses(props) {
    const theses = props.categoriesState == "success" && props.occasionsState == "success" && props.categories[props.instance]
      .map(thesisID => {
        const {womID, thesisNUM} = this.extractThesisID(thesisID);
        if (props.occasions[parseInt(womID)] == undefined) debugger;
        return props.occasions[parseInt(womID)].theses[parseInt(thesisNUM)];
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
        return <div key={thesis.id}>
          <Thesis {...thesis} loaded={false} navigate={this.props.navigate} />
        </div>;
      });

    const loading = this.props.categoriesState == "success" && this.props.occasionsState == "success" ? null
      : <p>Loading...</p>

    return <div className="category">
      <h1><a onClick={() => this.props.navigate("Themen")}>Themen</a> > {this.props.instance}</h1>
      <ul>
        {loading}
        {theses}
      </ul>
    </div>
  }
}
