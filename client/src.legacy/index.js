import React from "react"
import { hydrate, render } from "react-dom"
import "semantic-ui-css/semantic.min.css"

import "./index.css"
import App from "./app/"
import { unregister } from "./utils/registerServiceWorker"

const rootElement = document.getElementById("root")

unregister()

if (rootElement.hasChildNodes()) {
  hydrate(<App />, rootElement)
} else {
  render(<App />, rootElement)
}
