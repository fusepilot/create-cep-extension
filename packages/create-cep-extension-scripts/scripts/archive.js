// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const paths = require('../config/paths');
const zxp = require('zxp-sign-cmd');
const execSync = require('child_process').execSync;
const cwd = process.cwd();
const cep = require('./cep');

function preArchiveCheck() {
  const {
    CERTIFICATE_PASSWORD,
    CERTIFICATE_COUNTRY,
    CERTIFICATE_PROVINCE,
    CERTIFICATE_ORG,
    CERTIFICATE_NAME,
  } = cep.getSettings();

  if (!fs.existsSync(paths.appBuild)) {
    console.log();
    console.log(
      `${chalk.red('No build directory found to archive.')} Run ${chalk.blue(
        'yarn run build'
      )} first and then try again.`
    );
    console.log();
    process.exit(1);
  }

  if (!CERTIFICATE_PASSWORD) {
    console.log(
      chalk.yellow(
        'No CERTIFICATE_PASSWORD environment variable found. Defaulting to "password". Don\'t deploy before fixing.'
      )
    );
  }

  if (!CERTIFICATE_COUNTRY) {
    console.log(
      chalk.yellow(
        'No CERTIFICATE_COUNTRY environment variable found. Defaulting to "US". Don\'t deploy before fixing.'
      )
    );
  }

  if (!CERTIFICATE_PROVINCE) {
    console.log(
      chalk.yellow(
        'No CERTIFICATE_PROVINCE environment variable found. Defaulting to "CA". Don\'t deploy before fixing.'
      )
    );
  }

  if (!CERTIFICATE_ORG) {
    console.log(
      chalk.yellow(
        'No CERTIFICATE_ORG environment variable found. Defaulting to "My Organization". Don\'t deploy before fixing.'
      )
    );
  }

  if (!CERTIFICATE_NAME) {
    console.log(
      chalk.yellow(
        'No CERTIFICATE_NAME environment variable found. Defaulting to "My Name". Don\'t deploy before fixing.'
      )
    );
  }
}

function certificate() {
  const {
    CERTIFICATE_PASSWORD,
    CERTIFICATE_FILENAME,
    CERTIFICATE_COUNTRY,
    CERTIFICATE_PROVINCE,
    CERTIFICATE_ORG,
    CERTIFICATE_NAME,
  } = cep.getSettings();

  return new Promise((resolve, reject) => {
    zxp.selfSignedCert(
      {
        country: `"${CERTIFICATE_COUNTRY || 'US'}"`,
        province: `"${CERTIFICATE_PROVINCE || 'CA'}"`,
        org: `"${CERTIFICATE_ORG || 'org'}"`,
        name: `"${CERTIFICATE_NAME || 'name'}"`,
        password: CERTIFICATE_PASSWORD,
        output: CERTIFICATE_FILENAME,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
}

function fixZXPPermissions() {
  return new Promise((resolve, reject) => {
    if (process.platform !== 'win32') {
      execSync(`chmod +x ${require('zxp-provider').osx}`);
    }
    resolve();
  });
}

function getOutputFilename() {
  const { NAME, VERSION } = cep.getSettings();

  return `${NAME}-${VERSION}.zxp`.replace(/ /g, '-');
}

function getOutputPath(fileName) {
  return path.join(paths.appArchive, fileName);
}

function sign() {
  const { CERTIFICATE_PASSWORD, CERTIFICATE_FILENAME } = cep.getSettings();

  const filename = getOutputFilename();
  const outputPath = getOutputPath(filename);

  return new Promise((resolve, reject) => {
    zxp.sign(
      {
        input: paths.appBuild,
        output: outputPath,
        cert: CERTIFICATE_FILENAME,
        password: CERTIFICATE_PASSWORD,
      },
      (error, result) => {
        if (error) reject(error);
        else {
          resolve({
            result,
            filename,
            outputPath,
          });
        }
      }
    );
  });
}

// Create the production build and print the deployment instructions.
function bin() {
  const filename = getOutputFilename();
  const outputPath = getOutputPath(filename);

  fs.removeSync(outputPath);
  preArchiveCheck();
  console.log('Signing and archiving...');
  console.log();
  fixZXPPermissions()
    .then(certificate)
    .then(sign)
    .then(result => {
      console.log(`Created ${chalk.cyan(result.filename)}`);
      console.log();
    })
    .catch(error => console.error(error));
}

bin();
