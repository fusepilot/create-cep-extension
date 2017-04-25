import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import { inCEPEnvironment, loadExtendscript, evalExtendscript } from 'cep-interface'

if (inCEPEnvironment()) {
  evalExtendscript('writeLn("Hello Foos");') // writes "Hello Foo" to the info panel
}

ReactDOM.render(<App />, document.getElementById('root'))
