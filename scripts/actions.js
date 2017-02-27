const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const { execSync, spawn } = require('child_process')
const del = require('del')
const debugTemplate = require('../templates/.debug')
const manifestTemplate = require('../templates/manifest')
const panelTemplate = require('../templates/panel')
const uglifyJS = require('uglify-js')
require('dotenv').config()

var paths = require('../config/paths');

const NAME = process.env.EXTENSION_NAME
const PASSWORD = process.env.EXTENSION_CERTIFICATE_PASSWORD
const CERTIFICATE = process.env.EXTENSION_CERTIFICATE
const BUNDLE_ID = process.env.EXTENSION_BUNDLE_ID
const BUNDLE_VERSION = process.env.EXTENSION_BUNDLE_VERSION
const CEP_VERSION = process.env.EXTENSION_CEP_VERSION
const PANEL_WIDTH = process.env.EXTENSION_PANEL_WIDTH
const PANEL_HEIGHT = process.env.EXTENSION_PANEL_HEIGHT
const CEF_PARAMS = process.env.EXTENSION_CEF_PARAMS
const AUTO_OPEN_REMOTE_DEBUGGER = process.env.EXTENSION_AUTO_OPEN_REMOTE_DEBUGGER
const ENABLE_PLAYERDEBUGMODE = process.env.EXTENSION_ENABLE_PLAYERDEBUGMODE
const TAIL_LOGS = process.env.EXTENSION_TAIL_LOGS
const APP_IDS = process.env.EXTENSION_APP_IDS || 'AEFT'

const package = require('../package.json')
const VERSION = package.version.split('-')[0] // because ae doesnt load extensions that arent in the exact format '1.0.0'

// const zxpPath = (function () {
//   var exec_name = require('zxp-provider').bin;
//   exec_name = exec_name.substring(1, exec_name.length - 1);
//   return exec_name;
// })()

function createBuildFolder() {
  fs.removeSync(paths.appBuild)
}

function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml
  });
}

function copyExtendscriptFolder() {
  fs.copySync(paths.appExtendscriptSrc, paths.appBuild + '/extendscript', {
    dereference: true,
  });
}

function symlinkExtendscriptFolder() {
  const dest = paths.appBuild + '/extendscript'
  // fs.removeSync(dest)
  require('fs').symlinkSync(paths.appExtendscriptSrc, dest);
}

function enablePlayerDebugMode() {
  // enable unsigned extensions for CEP 4 5 6 and 7
  execSync(`
    defaults write com.adobe.CSXS.7 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.6 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.5 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.4 PlayerDebugMode 1;
  `)
}

function disablePlayerDebugMode() {
  // enable unsigned extensions for CEP 4 5 6 and 7
  execSync(`
    defaults write com.adobe.CSXS.7 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.6 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.5 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.4 PlayerDebugMode 0;
  `)
}

function tailLogs() {
  // tail the Adobe After Effects extension log files
  const files = [
    '/Library/Logs/CSXS/CEP6-AEFT.log',
    `/Library/Logs/CSXS/CEPHtmlEngine6-AEFT-14.0-${NAME}-renderer.log`,
    `/Library/Logs/CSXS/CEPHtmlEngine6-AEFT-14.0-${NAME}.log`
  ]
  files.forEach(file => spawn('tail', ['-f', path.join(process.env.HOME, file)], {
    end: process.env,
    stdio: 'inherit'
  }))
}

function openChromeRemoteDebugger() {
  // open the debugger page in chrome
  spawn('open', ['-a', 'Google Chrome', 'http://localhost:3001'], {
    end: process.env,
    stdio: 'inherit'
  })
}

function writeExtensionTemplates(env, {port}={}) {
  // make sure the CSXS folder exists
  // try {
  if (!fs.existsSync(paths.appBuild)) fs.mkdirSync(paths.appBuild)
  if (!fs.existsSync(path.join(paths.appBuild, 'CSXS'))) fs.mkdirSync(path.join(paths.appBuild, 'CSXS'))
  // } catch (err) {}

  if (env === 'dev') {
    // write .debug file
    const debugContents = debugTemplate(BUNDLE_ID, APP_IDS.split(','))
    fs.writeFileSync(path.join(paths.appBuild, '.debug'), debugContents)
  }

  // write manifest.xml file
  const manifestContents = manifestTemplate({
    bundleName: NAME,
    bundleId: BUNDLE_ID,
    bundleVersion: VERSION,
  })
  fs.writeFileSync(path.join(paths.appBuild, 'CSXS/manifest.xml'), manifestContents)

  const html = panelTemplate({env, title: NAME, port})
  fs.writeFileSync(path.join(paths.appBuild, 'panel.html'), html)
}

function symlinkExtension() {
  // symlink this extension into the extensions folder
  const CEP_EXTENSIONS_PATH = '/Library/Application\ Support/Adobe/CEP/extensions'
  const CEP_EXTENSIONS_PATH_ALT = path.join(process.env.HOME, CEP_EXTENSIONS_PATH)
  function symLink(target) {
    del.sync(target, { force: true })
    fs.symlinkSync(paths.appBuild, target)
  }
  try {
    const target = path.join(CEP_EXTENSIONS_PATH, BUNDLE_ID)
    symLink(target)
  } catch (err) {
    const target = path.join(CEP_EXTENSIONS_PATH_ALT, BUNDLE_ID)
    symLink(target)
  }
}



function compile(config) {
  console.log('Creating an optimized production build...');
  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        printErrors('Failed to compile.', [err]);
        reject(err);
      }

      if (stats.compilation.errors.length) {
        printErrors('Failed to compile.', stats.compilation.errors);
        reject(stats.compilation.errors);
      }

      if (process.env.CI && stats.compilation.warnings.length) {
        printErrors('Failed to compile.', stats.compilation.warnings);
        reject(stats.compilation.warnings);
      }

      console.log(chalk.green('Compiled successfully.'));
      console.log();

      resolve(stats)

      // console.log('File sizes after gzip:');
      // console.log();
      // printFileSizes(stats, previousSizeMap);
      // console.log();
    });
  })
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
  createBuildFolder,
}
