# Create CEP Extension

A near zero config approach to creating CEP extensions with Webpack and React.

## Installation

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

The extension will now be accesible from the target application's extensions menu.

### Building

````yarn run build````

The extension will be built into the build directory.

### Packaging

````yarn run bin````

The build directory will be packaged into a ````.zxp```` in the bin directory.

## Troubleshooting

If you get errors when running ````yarn run bin````, you probably need to build first, ````yarn run build````.

## Contributing

1. Fork it
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Todo

• Create boilerplate script.
• Script to initially create ````certificate.p12````. Still need to do that part manually up front right now.
• Create ````.jsxbin````'s automatically and smoothly without hacks. Adobe has made this nearly impossible on macOS, so not sure if its worth the trouble. Especially since .jsxbin dont really do much to deter hackers.