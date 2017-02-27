import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { loadExtendscript } from 'create-cep-extension/bridge'

ReactDOM.render(
  <App />, document.getElementById('root')
);

loadExtendscript('index.jsx')
