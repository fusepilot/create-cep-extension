# Create CEP Extension

Create CEP Extensions with no build configuration. Closely matches functionality from [Create React App](https://github.com/facebookincubator/create-react-app).

* [Getting Started](#getting-started) – How to create a new app.
* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/create-cep-extension-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

Create React App works on macOS, Windows, and Linux.<br>
If something doesn’t work please [file an issue](https://github.com/facebookincubator/create-react-app/issues/new).

## Quick Overview

```sh
npm install -g create-cep-extension

create-cep-extension my-cep-extension
cd my-cep-extension
npm start
```

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.<br>
When you’re ready to deploy to production, create a minified bundle with `npm run build`.

<img src='https://camo.githubusercontent.com/506a5a0a33aebed2bf0d24d3999af7f582b31808/687474703a2f2f692e696d6775722e636f6d2f616d794e66434e2e706e67' width='600' alt='npm start'>

### Get Started Immediately

You **don’t** need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.

Just create a project, and you’re good to go.

## Getting Started

### Installation

Install it once globally:

```sh
npm install -g create-cep-extension
```

**You’ll need to have Node >= 4 on your machine**.

**We strongly recommend to use Node >= 6 and npm >= 3 for faster installation speed and better disk usage.** You can use [nvm](https://github.com/creationix/nvm#usage) to easily switch Node versions between different projects.

**This tool doesn’t assume a Node backend**. The Node installation is only required for Create React App itself.

### Creating an App

To create a new app, run:

```sh
create-cep-extension my-cep-extension
cd my-cep-extension
```

It will create a directory called `my-cep-extension` inside the current folder.<cep-extension
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
my-cep-extension
  README.md
  node_modules/
  package.json
  .gitignore
  .env
  extendscript/
    index.jsx
  public/
    favicon.ico
    index.html
  src/
    App.css
    App.js
    App.test.js
    index.css
    index.js
    logo.svg
```

No configuration or complicated folder structures, just the files you need to build your app.<br>
Once the installation is done, you can run some commands inside the project folder:

### `npm start` or `yarn start`

Runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will see the build errors and lint warnings in the console.

<img src='https://camo.githubusercontent.com/41678b3254cf583d3186c365528553c7ada53c6e/687474703a2f2f692e696d6775722e636f6d2f466e4c566677362e706e67' width='600' alt='Build errors'>

### `npm test` or `yarn test`

Runs the test watcher in an interactive mode.<br>
By default, runs tests related to files changes since the last commit.

[Read more about testing.](https://github.com/facebookincubator/create-react-app/blob/master/packages/create-cep-extension-scripts/template/README.md#running-tests)

### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run archive` or `yarn archive`

Creates a ZXP archive of the `build` folder to the `archive` folder.<br>

You can then send the ZXP archive to your users to install using a ZXP installer. For instance:

- [aescripts + aeplugins ZXP Installer](http://aescripts.com/learn/zxp-installer/)
- [ZXP Installer](http://zxpinstaller.com/)

## Environment Variables

You can customize the name of the extension and multiple other variables by modifying the `.env` file. 

````bash
NAME="My Extension"
BUNDLE_ID="com.mycompany.myextension"
````

### Hosts

By default, the extension will target all known Adobe hosts. To target specific hosts, uncomment the `HOSTS` variable to `.env` and modify the list of the hosts you want to target.

For example, to target just Illustrator and After Effects, you would add this to your `.env` file:

````bash
HOSTS="ILST, AEFT"
````

And to target specific versions:

````bash
HOSTS="ILST, IDSN@*, PHXS@6.0, AEFT@[5.0,10.0]"
````

This will target all versions of Illustrator and In Design, Photoshop 6.0, and After Effects 5.0 - 10.0.

### Cerificate Variables

In order to create a valid ZXP, you will need to provide the following variables replaced with the correct information inside your `.env`.

```bash
CERTIFICATE_COUNTRY="US"
CERTIFICATE_PROVINCE="CA"
CERTIFICATE_ORG="MyCompany"
CERTIFICATE_NAME="com.mycompany"
CERTIFICATE_PASSWORD="mypassword"
```

## Communicating with Extendscript

There are few functions that you can import from the `cep-interface` package to ease Extendscript communication from CEP.

### `loadExtendscript(extendScriptFileName: string): Promise`

Loads and evaluates the specified file in the src/extendscript directory. Returns a promise with the result.

````javascript
import { loadExtendscript } from 'cep-interface'

loadExtendscript('index.jsx')
````

### `evalExtendscript(code: string): Promise`

Evaluates the specified code. Returns a Promise.

````javascript
import { evalExtendscript } from 'cep-interface'

evalExtendscript('writeLn("Hello Foo");') // writes "Hello Foo" to the info panel
````

If you return a JSON string using [json2](https://github.com/douglascrockford/JSON-js) or similar from Extendscript, you can get the parsed result.

````javascript
import { evalExtendscript } from 'cep-interface'

evalExtendscript('JSON.stringifiy({foo: "bar"});')
  .then(result => console.log(result)) // prints {foo: "bar"}
  .catch(error => console.warn(error))
````

## Other functions

There are a few other functions available in addition.

### `openURLInDefaultBrowser(url: string)`

````javascript
import { openURLInDefaultBrowser } from 'cep-interface'

openURLInDefaultBrowser('www.google.com')
````

Opens the url in the default browser. Will also work when viewing outside the target application in a browser.

## Contributing

We'd love to have your helping hand on `create-cep-extension`! See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on what we're looking for and how to get started.

## Todo

* Improve target host configuration per [#4](https://github.com/fusepilot/create-cep-extension/pull/4).
* Create ````.jsxbin````'s automatically and smoothly. Adobe has made this nearly impossible to do on macOS, so not sure if its worth the trouble. Especially since .jsxbin doesn't really deter hackers.
* Testing.