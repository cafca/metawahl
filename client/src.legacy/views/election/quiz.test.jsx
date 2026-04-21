import React from "react"
import ReactDOM from "react-dom"
import Quiz from "./quiz"
import { MemoryRouter as Router, Route } from "react-router-dom"

it("renders without crashing", () => {
  const div = document.createElement("div")
  const context = {
    elections: []
  }
  ReactDOM.render(
    <Router initialEntries={["/wahlen/hessen/44"]}>
      <Route
        exact
        path="/wahlen/:territory/:electionNum/"
        render={props => <Quiz {...props} {...context} />}
      />
    </Router>,
    div
  )
})
