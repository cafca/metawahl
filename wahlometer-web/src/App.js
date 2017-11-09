import React, { Component } from 'react';
import autoBind from 'react-autobind';
import logo from './logo.svg';
import './App.css';

const Navbar = props => <div>
  <a onClick={() => props.navigate("Wahlen")} style={{color: (props.page === "Wahlen" ? "red" : "white")}}>Wahlen</a>
  <a onClick={() => props.navigate("Themen")} style={{color: (props.page === "Themen" ? "red" : "white")}}>Themen</a>
</div>;

class OccasionList extends Component {
  constructor(props) {
    super(props);
    autoBind(this);
  }

  render() {
    return "Hello"
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
      data: "ongoing"
    }
    autoBind(this);
  }

  navigate(page) {
    this.setState({page});
  }

  componentDidMount() {
    fetch("/")
  }

  render() {
    const content = this.state.page === "Wahlen" ? <OccasionList /> : <TopicList />;
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
