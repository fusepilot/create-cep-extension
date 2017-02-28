// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({silent: true})

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const paths = require('../config/paths')
const zxp = require('zxp-sign-cmd')
const execSync = require('child_process').execSync
const cwd = process.cwd()

const NAME = process.env.EXTENSION_NAME
const PASSWORD = process.env.EXTENSION_CERTIFICATE_PASSWORD
const CERTIFICATE = process.env.EXTENSION_CERTIFICATE

const package = require(path.join(cwd, 'package.json'))
const VERSION = package.version

const fileName = `"${NAME}-${VERSION}.zxp"`
const outputPath = path.join(paths.appBin, fileName)


function certificate() {
  const options = {
    country: process.env.EXTENSION_CERTIFICATE_COUNTRY,
    province: process.env.EXTENSION_CERTIFICATE_PROVINCE,
    org: process.env.EXTENSION_CERTIFICATE_ORG,
    name: process.env.EXTENSION_CERTIFICATE_NAME,
    password: process.env.EXTENSION_CERTIFICATE_PASSWORD,
    output: process.env.EXTENSION_CERTIFICATE,
  }
  return new Promise((resolve, reject) => {
    zxp.selfSignedCert(options, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

function fixZXPPermissions() {
  return new Promise((resolve, reject) => {
    execSync(`chmod +x ${require('zxp-provider').osx}`)
    resolve()
  })
}

function sign() {
  const options = {
    input: paths.appBuild,
    output: outputPath,
    cert: process.env.EXTENSION_CERTIFICATE,
    password: process.env.EXTENSION_CERTIFICATE_PASSWORD,
  }
  return new Promise((resolve, reject) => {
    zxp.sign(options, (error, result) => {
      if (error) reject(error)
      else resolve({
        result,
        fileName,
        outputPath,
      })
    })
  })
}

// Create the production build and print the deployment instructions.
function bin() {
  fs.removeSync(outputPath)
  console.log('Signing and Archiving')
  fixZXPPermissions()
    .then(certificate)
    .then(sign)
    .then(result => {
      console.log(`Created ${chalk.cyan(result.fileName)}`)
      console.log()
    })
    .catch(error => console.error(error))
}

bin()