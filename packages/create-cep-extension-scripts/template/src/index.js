import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { inCEPEnvironment, evalExtendscript } from 'cep-interface';

if (inCEPEnvironment()) {
  // write "Hello World!" to the info panel inside the host application
  evalExtendscript('$.writeln("Hello World!");');
}

ReactDOM.render(<App />, document.getElementById('root'));
