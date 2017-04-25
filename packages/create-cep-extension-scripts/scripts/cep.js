const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const { execSync, spawn } = require('child_process')
const del = require('del')
const debugTemplate = require('./templates/.debug')
const manifestTemplate = require('./templates/manifest')
const panelTemplate = require('./templates/panel')
const uglifyJS = require('uglify-js')
require('dotenv').config({ silent: true })

var paths = require('../config/paths')

function getSettings () {
  const packageJSON = require('../package.json')
  const VERSION = packageJSON.version.split('-')[0] // because ae doesnt load extensions that arent in the exact format '1.0.0'

  return {
    NAME: process.env.NAME || 'My CEP Extension',
    PASSWORD: process.env.CERTIFICATE_PASSWORD || '',
    CERTIFICATE_FILENAME: process.env.CERTIFICATE_FILENAME || '',
    BUNDLE_ID: process.env.BUNDLE_ID || 'my.cep.extension',
    BUNDLE_VERSION: process.env.BUNDLE_VERSION || '1.0.0',
    CEP_VERSION: process.env.CEP_VERSION || '',
    PANEL_WIDTH: process.env.PANEL_WIDTH || '',
    PANEL_HEIGHT: process.env.PANEL_HEIGHT || '',
    CEF_PARAMS: process.env.CEF_PARAMS || '',
    AUTO_OPEN_REMOTE_DEBUGGER: process.env.AUTO_OPEN_REMOTE_DEBUGGER || '',
    ENABLE_PLAYERDEBUGMODE: process.env.ENABLE_PLAYERDEBUGMODE || '',
    TAIL_LOGS: process.env.TAIL_LOGS || '',
    HOST_IDS: process.env.HOST_IDS,
    HOST_VERSIONS: process.env.HOST_VERSIONS,
    CERTIFICATE_COUNTRY: process.env.CERTIFICATE_COUNTRY || 'US',
    CERTIFICATE_PROVINCE: process.env.CERTIFICATE_PROVINCE || 'CA',
    CERTIFICATE_ORG: process.env.CERTIFICATE_ORG || 'org',
    CERTIFICATE_NAME: process.env.CERTIFICATE_NAME || 'name',
    VERSION: VERSION || '1.0.0'
  }
}

// const zxpPath = (function () {
//   var exec_name = require('zxp-provider').bin;
//   exec_name = exec_name.substring(1, exec_name.length - 1);
//   return exec_name;
// })()

function createBuildFolder () {
  fs.removeSync(paths.appBuild)
}

function printErrors (summary, errors) {
  console.log(chalk.red(summary))
  console.log()
  errors.forEach(err => {
    console.log(err.message || err)
    console.log()
  })
}

function copyPublicFolder () {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml
  })
}

function copyExtendscriptFolder () {
  fs.copySync(paths.appExtendscriptSrc, paths.appBuild + '/extendscript', {
    dereference: true
  })
}

function symlinkExtendscriptFolder () {
  const dest = paths.appBuild + '/extendscript'
  // fs.removeSync(dest)
  require('fs').symlinkSync(paths.appExtendscriptSrc, dest)
}

function enablePlayerDebugMode () {
  // enable unsigned extensions for CEP 4 5 6 and 7
  execSync(
    `
    defaults write com.adobe.CSXS.7 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.6 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.5 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.4 PlayerDebugMode 1;
  `
  )
}

function disablePlayerDebugMode () {
  // enable unsigned extensions for CEP 4 5 6 and 7
  execSync(
    `
    defaults write com.adobe.CSXS.7 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.6 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.5 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.4 PlayerDebugMode 0;
  `
  )
}

function tailLogs () {
  const { NAME } = getSettings()
  // tail the Adobe After Effects extension log files
  const files = [
    '/Library/Logs/CSXS/CEP6-AEFT.log',
    `/Library/Logs/CSXS/CEPHtmlEngine6-AEFT-14.0-${NAME}-renderer.log`,
    `/Library/Logs/CSXS/CEPHtmlEngine6-AEFT-14.0-${NAME}.log`
  ]
  files.forEach(file =>
    spawn('tail', ['-f', path.join(process.env.HOME, file)], {
      end: process.env,
      stdio: 'inherit'
    })
  )
}

function openChromeRemoteDebugger () {
  // open the debugger page in chrome
  spawn('open', ['-a', 'Google Chrome', 'http://localhost:3001'], {
    end: process.env,
    stdio: 'inherit'
  })
}

function writeExtensionTemplates (env, { port } = {}) {
  const { NAME, VERSION, BUNDLE_ID, HOST_IDS, HOST_VERSIONS } = getSettings()
  // make sure the CSXS folder exists
  if (!fs.existsSync(paths.appBuild)) fs.mkdirSync(paths.appBuild)
  if (!fs.existsSync(path.join(paths.appBuild, 'CSXS'))) {
    fs.mkdirSync(path.join(paths.appBuild, 'CSXS'))
  }

  if (env === 'dev') {
    // write .debug file
    const debugContents = debugTemplate(BUNDLE_ID, HOST_IDS)
    fs.writeFileSync(path.join(paths.appBuild, '.debug'), debugContents)
  }

  // write manifest.xml file
  const manifestContents = manifestTemplate({
    bundleName: NAME,
    bundleId: BUNDLE_ID,
    bundleVersion: VERSION,
    bundleHostIds: HOST_IDS,
    bundleHostVersions: HOST_VERSIONS
  })
  fs.writeFileSync(path.join(paths.appBuild, 'CSXS/manifest.xml'), manifestContents)

  // write manifest.xml file
  const panelContents = panelTemplate({
    title: NAME,
    port
  })
  fs.writeFileSync(path.join(paths.appBuild, 'index.html'), panelContents)
}

function getSymlinkExtensionPath () {
  const { BUNDLE_ID } = getSettings()
  const CEP_EXTENSIONS_PATH = '/Library/Application\ Support/Adobe/CEP/extensions'
  return path.join(process.env.HOME, CEP_EXTENSIONS_PATH, BUNDLE_ID)
}

function symlinkExtension () {
  let target = getSymlinkExtensionPath()
  del.sync(target, { force: true })
  fs.symlinkSync(paths.appBuild, target)
}

function printCEPExtensionLocation () {
  console.log(`Extension location: ${chalk.blue(getSymlinkExtensionPath())}`)
}

function printCEPLogLocation () {
  let logLocation
  if (process.platform === 'win32') {
    logLocation = path.join(process.env.HOME, 'AppData\Local\Temp')
  } else {
    logLocation = path.join(process.env.HOME, 'Library/Logs/CSXS')
  }
  console.log(`Logs location: ${chalk.blue(logLocation)}`)
}

function printLocationInApplication () {
  const { NAME } = getSettings()
  console.log(
    `Location in Adobe CC: ${chalk.blue('Window')} > ${chalk.blue('Extensions')} > ${chalk.blue(NAME)}`
  )
}

function compile ({ port }) {
  createBuildFolder()
  copyPublicFolder()
  enablePlayerDebugMode()
  writeExtensionTemplates('dev', { port })
  symlinkExtendscriptFolder()
  symlinkExtension()
}

function compileMessages () {
  printCEPLogLocation()
  printCEPExtensionLocation()
  printLocationInApplication()
}

function build () {
  createBuildFolder()
  writeExtensionTemplates('prod')
  copyExtendscriptFolder()
}

function buildMessages () {
  printCEPLogLocation()
  printCEPExtensionLocation()
  printLocationInApplication()
}

module.exports = {
  enablePlayerDebugMode,
  disablePlayerDebugMode,
  copyPublicFolder,
  copyExtendscriptFolder,
  symlinkExtendscriptFolder,
  tailLogs,
  openChromeRemoteDebugger,
  writeExtensionTemplates,
  symlinkExtension,
  compile,
  build,
  createBuildFolder,
  compileMessages,
  buildMessages
}
