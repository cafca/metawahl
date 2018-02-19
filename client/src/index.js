import React from 'react';
import { hydrate, render } from 'react-dom';
import 'semantic-ui-css/semantic.min.css';

import './index.css';
import App from './app/';
import registerServiceWorker from './utils/registerServiceWorker';

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  hydrate(<App />, rootElement);
} else {
  render(<App />, rootElement);
}

registerServiceWorker();
