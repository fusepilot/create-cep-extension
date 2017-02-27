import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';
import { loadExtendscript } from '../../../bridge' // remove
// import { loadExtendscript } from 'create-cep-extension/bridge' // uncomment

ReactDOM.render(
  <App />, document.getElementById('root')
);

loadExtendscript('index.jsx')
