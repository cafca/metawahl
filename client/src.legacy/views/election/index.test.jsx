import React from "react"
import ReactDOM from "react-dom"
import Election from "./"
import { MemoryRouter as Router, Route } from "react-router-dom"

it("renders without crashing", () => {
  const div = document.createElement("div")
  const context = {
    elections: []
  }
  ReactDOM.render(
    <Router initialEntries={["/quiz/hessen/44"]}>
      <Route
        exact
        path="/quiz/:territory/:electionNum/"
        render={props => <Election {...props} {...context} />}
      />
    </Router>,
    div
  )
})
