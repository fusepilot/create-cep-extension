# Create CEP Extension

A near zero config approach to creating CEP extensions with Webpack and React.

## Installation

It's recommended to download and start from the [example project](https://github.com/fusepilot/create-cep-extension-example). If you do, skip to the usage section below.

````yarn add -D create-cep-extension````

Then add these scripts to your package.json. 

````json
"scripts": {
  "start": "node ./node_modules/create-cep-extension/scripts/start.js",
  "build": "node ./node_modules/create-cep-extension/scripts/build.js",
  "bin": "node ./node_modules/create-cep-extension/scripts/bin.js",
}
````

Then finally add a ````.env```` file with your extension's configuration.

````bash
EXTENSION_NAME="My Extension"
EXTENSION_APP_IDS="AEFT"
EXTENSION_APP_VERSIONS="13.0"
EXTENSION_BUNDLE_ID="com.mycompany.myextension"

EXTENSION_CERTIFICATE_COUNTRY="US"
EXTENSION_CERTIFICATE_PROVINCE="CA"
EXTENSION_CERTIFICATE_ORG="MyCompany"
EXTENSION_CERTIFICATE_NAME="com.mycompany"
EXTENSION_CERTIFICATE_PASSWORD="mypassword"
EXTENSION_CERTIFICATE="certificate.p12"
````



## Usage

### Development

````yarn run start````

The extension will now be accesible from the target application's extensions menu. You will also be able to view the extension in a browser window, usually from [http://localhost:3000](http://localhost:3000). If you make a change, the window will reload (most of the time).

### Building

````yarn run build````

The extension will be built into the build directory.

### Packaging

````yarn run bin````

The build directory will be packaged into a ````.zxp```` in the bin directory.



## Communicating with Extendscript

There are two helper methods that you can import and use to ease Extendscript communication.

### `loadExtendscript(extendScriptFileName: string): Promise`

Loads and evaluates the specified file in the src/extendscript directory. Returns a promise with the result.

````javascript
loadExtendscript('index.jsx')
````

### `evalExtendscript(code: string): Promise`

Evaluates the specified code. Returns a Promise.

````javascript
evalExtendscript('writeLn("Hello Foo");') // writes "Hello Foo" to the info panel
````

If you return a JSON string using [json2](https://github.com/douglascrockford/JSON-js) or similar from Extendscript, you can get the parsed result.

````javascript
evalExtendscript('JSON.stringifiy({foo: "bar"});')
  .then(result => console.log(result)) // prints {foo: "bar"}
  .catch(error => console.warn(error))
````

## Other helper methods

### `openURLInDefaultBrowser(url: string)`

Opens the url in the default browser. Will also work when viewing outside the target application in a browser.

## Troubleshooting

If you get errors when running ````yarn run bin````, you probably need to build first, ````yarn run build````.



## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request



## Todo

* Create boilerplate script.
* Script to initially create ````certificate.p12````. Still need to do that part manually up front right now.
* Create ````.jsxbin````'s automatically and smoothly. Adobe has made this nearly impossible to do on macOS, so not sure if its worth the trouble. Especially since .jsxbin doesn't really deter hackers.
