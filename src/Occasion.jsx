import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';
import _ from 'lodash';
import Thesis from './Thesis';

export default class Occasion extends React.Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      loading: "loading",
      theses: this.props.instance.theses
    }
  }

  componentDidMount() {
    const url = `/data/WOM-${this.props.instance.occasion.num}.json`;
    fetch(url)
      .then(response => response.json())
      .then(respData => {
        const thesesExtended = this.state.theses.map(t => {
          const newPositions = respData.data.filter(t1 => t1.id == t.id)[0].positions
          return Object.assign({}, t, {positions: newPositions});
        });

        this.setState({theses: thesesExtended, loading: "success"});
      })
      .catch(error => {
        console.log(error);
        this.setState({loading: "error"});
      });
  }

  checkScrolling() {
    if (window.location.hash != undefined) {
      const hashElems = window.location.hash.split("-");
      if (hashElems.length == 3 && parseInt(hashElems[1]) === this.props.instance.occasion.num) {
        const elem = document.getElementById(window.location.hash.slice(1));
        elem.scrollTop = 0;
      }
    }
  }

  render() {

    const theses = this.state.theses.map(t =>
      <Thesis {...t} key={t.id} loaded={this.state.loading === "success"} navigate={this.props.navigate} />
    );

    this.checkScrolling();

    return <div>
      <h1><a onClick={() => this.props.navigate("Wahlen")}>Wahlen</a> > {this.props.instance.occasion.title}</h1>
      <h3>Thesen</h3>
      <ul className="theses">
        {theses}
      </ul>
    </div>;
  }
}
