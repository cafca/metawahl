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

  render() {

    const theses = this.state.theses.map(t =>
      <Thesis {...t} key={t.id} loaded={this.state.loading === "success"} />
    );

    return <div>
      <h1><a onClick={() => this.props.navigate("Wahlen")}>Wahlen</a> > {this.props.instance.occasion.title}</h1>
      <h3>Thesen</h3>
      <ul className="theses">
        {theses}
      </ul>
    </div>;
  }
}
