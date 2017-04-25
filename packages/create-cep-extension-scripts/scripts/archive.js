// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true })

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const paths = require('../config/paths')
const zxp = require('zxp-sign-cmd')
const execSync = require('child_process').execSync
const cwd = process.cwd()
const cep = require('./cep')

const NAME = process.env.EXTENSION_NAME || 'My Extension'
const PASSWORD = process.env.EXTENSION_CERTIFICATE_PASSWORD || 'password'
const CERTIFICATE = process.env.EXTENSION_CERTIFICATE || 'certificate.p12'

const packageJSON = require(path.join(cwd, 'package.json'))
const VERSION = packageJSON.version || '1.0.0'

const fileName = `"${NAME}-${VERSION}.zxp"`
const outputPath = path.join(paths.appArchive, fileName)

function preBinCheck () {
  if (!process.env.EXTENSION_CERTIFICATE_PASSWORD) {
    console.log(
      chalk.yellow(
        'No EXTENSION_CERTIFICATE_PASSWORD environment variable found. Defaulting to "password". Don\'t deploy before fixing.'
      )
    )
  }

  if (!process.env.EXTENSION_CERTIFICATE_COUNTRY) {
    console.log(
      chalk.yellow(
        'No EXTENSION_CERTIFICATE_COUNTRY environment variable found. Defaulting to "US". Don\'t deploy before fixing.'
      )
    )
  }

  if (!process.env.EXTENSION_CERTIFICATE_PROVINCE) {
    console.log(
      chalk.yellow(
        'No EXTENSION_CERTIFICATE_PROVINCE environment variable found. Defaulting to "CA". Don\'t deploy before fixing.'
      )
    )
  }

  if (!process.env.EXTENSION_CERTIFICATE_ORG) {
    console.log(
      chalk.yellow(
        'No EXTENSION_CERTIFICATE_ORG environment variable found. Defaulting to "My Organization". Don\'t deploy before fixing.'
      )
    )
  }

  if (!process.env.EXTENSION_CERTIFICATE_NAME) {
    console.log(
      chalk.yellow(
        'No EXTENSION_CERTIFICATE_NAME environment variable found. Defaulting to "My Name". Don\'t deploy before fixing.'
      )
    )
  }
}

function certificate () {
  const options = {
    country: process.env.EXTENSION_CERTIFICATE_COUNTRY || 'US',
    province: process.env.EXTENSION_CERTIFICATE_PROVINCE || 'CA',
    org: process.env.EXTENSION_CERTIFICATE_ORG || 'org',
    name: process.env.EXTENSION_CERTIFICATE_NAME || 'name',
    password: PASSWORD,
    output: CERTIFICATE
  }
  return new Promise((resolve, reject) => {
    zxp.selfSignedCert(options, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function fixZXPPermissions () {
  return new Promise((resolve, reject) => {
    execSync(`chmod +x ${require('zxp-provider').osx}`)
    resolve()
  })
}

function sign () {
  const options = {
    input: paths.appBuild,
    output: outputPath,
    cert: CERTIFICATE,
    password: PASSWORD
  }
  return new Promise((resolve, reject) => {
    zxp.sign(options, (error, result) => {
      if (error) reject(error)
      else {
        resolve({
          result,
          fileName,
          outputPath
        })
      }
    })
  })
}

// Create the production build and print the deployment instructions.
function bin () {
  fs.removeSync(outputPath)
  console.log('Signing and archiving...')
  console.log()
  preBinCheck()
  fixZXPPermissions()
    .then(certificate)
    .then(sign)
    .then(result => {
      console.log()
      console.log(`Created ${chalk.cyan(result.fileName)}`)
      console.log()
    })
    .catch(error => console.error(error))
}

bin()
