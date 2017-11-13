import React, { Component } from 'react';
import autoBind from 'react-autobind';
import logo from './logo.svg';
import './App.css';
import _ from 'lodash';

const Navbar = props => <div className="navbar">
  <a
    onClick={() => props.navigate("Wahlen")}
    style={{color: (props.page === "Wahlen" ? "red" : "white")}}>Wahlen</a>
  <a
    onClick={() => props.navigate("Themen")}
    style={{color: (props.page === "Themen" ? "red" : "white")}}>Themen</a>
</div>;

class OccasionList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    const territories = {};
    this.props.occasions.map(occasion => {
      if (territories[occasion.occasion.territory] == undefined) {
        territories[occasion.occasion.territory] = [];
      }

      territories[occasion.occasion.territory].push(<li key={occasion.occasion.title}>
      <a onClick={() => this.props.navigate("Wahl", occasion.occasion.num)}>
        {occasion.occasion.title}
      </a>
    </li>);
    });

    const occasions = Object.keys(territories)
      .sort()
      .map(territory => {
        const cur = territories[territory];
        return <div className="territory">
          <h2>{_.startCase(territory)}</h2>
          <ul>
            {cur}
          </ul>
        </div>;
      });

    return this.props.data === "loading" ? <p>Loading...</p> :
      <div>
        <h1>Wahlen</h1>
        <ul>
          {occasions}
        </ul>
      </div>;
  }
};

class Thesis extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
    this.state = {
      openText: null
    }
  }

  toggleOpen(party) {
    this.setState({openText: party});
  }

  render() {
    let proParties = this.props.positions.filter(p => p.value === 1);
    let neutralParties = this.props.positions.filter(p => p.value === 0);
    let contraParties = this.props.positions.filter(p => p.value === -1);

    let showPro = proParties.length > 0
      ? <div className="position_values">Pro: {proParties.map(p =>
          <span key={p.party} onClick={() => this.toggleOpen(p)}>{p.party}, </span>
        )}</div> : null;

    let showNeutral = neutralParties.length > 0
      ? <div className="position_values">Neutral: {neutralParties.map(p =>
          <span key={p.party} onClick={() => this.toggleOpen(p)}>{p.party}, </span>
        )}</div> : null;

    let showContra = contraParties.length > 0
      ? <div className="position_values">Contra: {contraParties.map(p =>
          <span key={p.party} onClick={() => this.toggleOpen(p)}>{p.party}, </span>
        )}</div> : null;

    const positionText = this.state.openText == undefined || this.props.loaded === false
      ? null : <p>Position der {this.state.openText.party}: {this.state.openText.text}</p>;

    return <li>
      {this.props.title.length > 0 &&
        <span>
        <h2>{this.props.title}</h2>
        <h4>{this.props.text}</h4>
        </span>
      }

      {this.props.title.length == 0 &&
        <h2>
          <span style={{marginLeft: 5}}>{this.props.text}</span>
        </h2>
      }

      <em>{this.props.id}</em>&nbsp;
      <p>
        {showPro}
        {showNeutral}
        {showContra}
      </p>
      {positionText}
    </li>
  }
}

class Occasion extends React.Component {
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


class TopicList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    return "Goodbye"
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "Wahlen",
      instance: null,
      data: "loading",
      occasions: []
    }
    autoBind(this);
  }

  navigate(page, instance=null) {
    this.setState({page, instance}, () => {window.scrollTo(0, 0);});
  }

  componentDidMount() {
    fetch("/data/occasions.json")
      .then(response => response.json())
      .then(occasions => {
        this.setState({occasions, data: "success"});
      })
      .catch(error => {
        this.setState({
          data: "error",
          error: error
        });
      });
  }

  render() {
    const childProps = {
      occasions: this.state.occasions,
      data: this.state.data,
      navigate: this.navigate
    };

    let content;
    if (this.state.page === "Wahlen") {
      content = <OccasionList {...childProps} />;
    } else if (this.state.page === "Wahl") {
      content = <Occasion instance={this.state.occasions.filter(o => o.occasion.num === this.state.instance)[0]} navigate={this.navigate} />;
    } else {
      content = <TopicList {...childProps} />;
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Wahl-o-Meter Web</h1>
          <Navbar navigate={this.navigate} page={this.state.page} />
        </header>
        {content}
      </div>
    );
  }
}

export default App;
