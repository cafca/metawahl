import React from 'react';
import autoBind from 'react-autobind';
import './App.css';
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

  checkScrolling() {
    if (window.location.hash != null) {
      const hashElems = window.location.hash.split("-");
      if (hashElems.length === 3 && parseInt(hashElems[1], 10) === this.props.instance.occasion.num) {
        const elem = document.getElementById(window.location.hash.slice(1));
        if (elem) elem.scrollTop = 0;
      }
    }
  }

  render() {
    const theses = this.state.theses.map((t, i) => {
      // Set to positionTexts entry once loaded
      const positions = this.props.positionTexts != null
        ? this.props.positionTexts[t.id] : t.positions;

      return <Thesis
        key={t.id}
        loaded={this.state.loading === "success"}
        navigate={this.props.navigate}
        {...t}
        positions={positions}
      />
    });

    return <div>
      <h1><a onClick={() => this.props.navigate("Wahlen")}>Wahlen</a> > {this.props.instance.occasion.title}</h1>
      <h3>Thesen</h3>
      <ul className="theses">
        {theses}
      </ul>
    </div>;
  }
}
