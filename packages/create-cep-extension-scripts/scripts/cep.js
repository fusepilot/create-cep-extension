const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync, spawn } = require('child_process');
const debugTemplate = require('./templates/debug');
const manifestTemplate = require('./templates/manifest');
const panelTemplate = require('./templates/panel');
require('dotenv').config({ silent: true });

var paths = require('../config/paths');

function getSettings() {
  const packageJSONPath = path.join(paths.appPath, 'package.json');
  const packageJSON = require(packageJSONPath);
  const VERSION = packageJSON.version.split('-')[0]; // because ae doesnt load extensions that arent in the exact format '1.0.0'

  return {
    NAME: process.env.NAME || 'My CEP Extension',
    VERSION: VERSION || '1.0.0',
    BUNDLE_ID: process.env.BUNDLE_ID || 'my.cep.extension',
    BUNDLE_VERSION: process.env.BUNDLE_VERSION || VERSION || '1.0.0',
    CEP_VERSION: process.env.CEP_VERSION || '',
    UI_TYPE: process.env.UI_TYPE || 'Panel',//Panel,ModalDialog,Modeless,default Panel.
    PANEL_WIDTH: process.env.PANEL_WIDTH || '500',
    PANEL_HEIGHT: process.env.PANEL_HEIGHT || '500',
    CEF_PARAMS: process.env.CEF_PARAMS || '',
    AUTO_OPEN_REMOTE_DEBUGGER: process.env.AUTO_OPEN_REMOTE_DEBUGGER || '',
    ENABLE_PLAYERDEBUGMODE: process.env.ENABLE_PLAYERDEBUGMODE || '',
    TAIL_LOGS: process.env.TAIL_LOGS || '',
    HOSTS:
      process.env.HOSTS ||
      'PHXS, PHSP, IDSN, AICY, ILST, PPRO, AEFT, PRLD, FLPR, DRWV',
    CERTIFICATE_PASSWORD:
      process.env.CERTIFICATE_PASSWORD || 'certificate-password',
    CERTIFICATE_FILENAME: process.env.CERTIFICATE_FILENAME || 'certificate.p12',
    CERTIFICATE_COUNTRY: process.env.CERTIFICATE_COUNTRY || 'US',
    CERTIFICATE_PROVINCE: process.env.CERTIFICATE_PROVINCE || 'CA',
    CERTIFICATE_ORG: process.env.CERTIFICATE_ORG || 'org',
    CERTIFICATE_NAME: process.env.CERTIFICATE_NAME || 'name',
    ICON_NORMAL: process.env.ICON_NORMAL || '',
    ICON_ROLLOVER: process.env.ICON_ROLLOVER || '',
    ICON_DARK_NORMAL: process.env.ICON_DARK_NORMAL || '',
    ICON_DARK_ROLLOVER: process.env.ICON_DARK_ROLLOVER || '',
  };
}

// const zxpPath = (function () {
//   var exec_name = require('zxp-provider').bin;
//   exec_name = exec_name.substring(1, exec_name.length - 1);
//   return exec_name;
// })()

function createBuildFolder() {
  fs.removeSync(paths.appBuild);
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
    filter: file => file !== paths.appHtml,
  });
}

function copyExtendscriptFolder() {
  fs.copySync(paths.appExtendscriptSrc, paths.appBuild + '/extendscript', {
    dereference: true,
  });
}

function symlinkExtendscriptFolder() {
  const dest = paths.appBuild + '/extendscript';
  // fs.removeSync(dest)
  require('fs').symlinkSync(paths.appExtendscriptSrc, dest);
}

function enablePlayerDebugMode() {
  // enable unsigned extensions for the foreseable future
  execSync(
    `
    defaults write com.adobe.CSXS.15 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.14 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.13 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.12 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.11 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.10 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.9 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.8 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.7 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.6 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.5 PlayerDebugMode 1;
    defaults write com.adobe.CSXS.4 PlayerDebugMode 1;
  `
  );
}

function disablePlayerDebugMode() {
  // disable unsigned extensions for the foreseable future
  execSync(
    `
    defaults write com.adobe.CSXS.15 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.14 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.13 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.12 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.11 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.10 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.9 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.8 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.7 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.6 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.5 PlayerDebugMode 0;
    defaults write com.adobe.CSXS.4 PlayerDebugMode 0;
  `
  );
}

function tailLogs() {
  const { NAME } = getSettings();
  // tail the Adobe After Effects extension log files
  const files = [
    '/Library/Logs/CSXS/CEP6-AEFT.log',
    `/Library/Logs/CSXS/CEPHtmlEngine6-AEFT-14.0-${NAME}-renderer.log`,
    `/Library/Logs/CSXS/CEPHtmlEngine6-AEFT-14.0-${NAME}.log`,
  ];
  files.forEach(file =>
    spawn('tail', ['-f', path.join(process.env.HOME, file)], {
      end: process.env,
      stdio: 'inherit',
    })
  );
}

function openChromeRemoteDebugger() {
  // open the debugger page in chrome
  spawn('open', ['-a', 'Google Chrome', 'http://localhost:3001'], {
    end: process.env,
    stdio: 'inherit',
  });
}

function writeExtensionTemplates(env, { port } = {}) {
  const {
    NAME,
    VERSION,
    BUNDLE_ID,
    BUNDLE_VERSION,
    HOSTS,
    UI_TYPE,
    PANEL_WIDTH,
    PANEL_HEIGHT,
    ICON_NORMAL,
    ICON_ROLLOVER,
    ICON_DARK_NORMAL,
    ICON_DARK_ROLLOVER,
  } = getSettings();

  // make sure the CSXS folder exists
  if (!fs.existsSync(paths.appBuild)) fs.mkdirSync(paths.appBuild);
  if (!fs.existsSync(path.join(paths.appBuild, 'CSXS'))) {
    fs.mkdirSync(path.join(paths.appBuild, 'CSXS'));
  }

  const hosts = HOSTS.split(/(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/)
    .map(host => host.trim())
    .map(host => {
      let [name, version] = host.split('@');

      if (version == '*' || !version) {
        version = '[0.0,99.9]';
      } else if (version) {
        version = version;
      }

      return {
        name,
        version,
      };
    });

  if (env === 'dev') {
    // write .debug file
    const debugContents = debugTemplate(BUNDLE_ID, hosts);
    fs.writeFileSync(path.join(paths.appBuild, '.debug'), debugContents);
  }

  // write manifest.xml file
  const manifestContents = manifestTemplate({
    bundleName: NAME,
    bundleId: BUNDLE_ID,
    version: VERSION,
    hosts,
    uiType: UI_TYPE,
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    bundleVersion: BUNDLE_VERSION,
    icon: {
      normal: ICON_NORMAL,
      rollover: ICON_ROLLOVER,
      darkNormal: ICON_DARK_NORMAL,
      darkRollover: ICON_DARK_ROLLOVER,
    },
  });
  fs.writeFileSync(
    path.join(paths.appBuild, 'CSXS/manifest.xml'),
    manifestContents
  );

  // write manifest.xml file
  const panelContents = panelTemplate({
    title: NAME,
    port,
  });
  fs.writeFileSync(path.join(paths.appBuild, 'index.html'), panelContents);
}

function getExtenstionPath() {
  if (process.platform === 'win32') {
    return 'C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions';
  } else {
    return '/Library/Application Support/Adobe/CEP/extensions';
  }
}

function getSymlinkExtensionPath() {
  const { BUNDLE_ID } = getSettings();
  const extensionPath = getExtenstionPath();
  if (process.platform === 'win32') {
    return path.join(extensionPath, BUNDLE_ID);
  } else {
    return path.join(process.env.HOME, extensionPath, BUNDLE_ID);
  }
}

function symlinkExtension() {
  fs.ensureDirSync(getExtenstionPath());
  let target = getSymlinkExtensionPath();
  fs.removeSync(target);
  if (process.platform === 'win32') {
    fs.symlinkSync(paths.appBuild, target, 'junction');
  } else {
    fs.symlinkSync(paths.appBuild, target);
  }
}

function printCEPExtensionLocation() {
  console.log(`Extension location: ${chalk.blue(getSymlinkExtensionPath())}`);
}

function printCEPLogLocation() {
  let logLocation;
  if (process.platform === 'win32') {
    logLocation = path.join(process.env.HOME, 'AppDataLocalTemp');
  } else {
    logLocation = path.join(process.env.HOME, 'Library/Logs/CSXS');
  }
  console.log(`Logs location: ${chalk.blue(logLocation)}`);
}

function printLocationInApplication() {
  const { NAME } = getSettings();
  console.log(
    `Location in Adobe CC: ${chalk.blue('Window')} > ${chalk.blue(
      'Extensions'
    )} > ${chalk.blue(NAME)}`
  );
}

function compile({ port }) {
  createBuildFolder();
  copyPublicFolder();
  enablePlayerDebugMode();
  writeExtensionTemplates('dev', { port });
  symlinkExtendscriptFolder();
  symlinkExtension();
}

function compileMessages() {
  console.log();
  printCEPLogLocation();
  printCEPExtensionLocation();
  printLocationInApplication();
  console.log();
}

function build() {
  createBuildFolder();
  copyPublicFolder();
  writeExtensionTemplates('prod');
  copyExtendscriptFolder();
}

function buildMessages() {
  console.log();
  printCEPLogLocation();
  printCEPExtensionLocation();
  printLocationInApplication();
  console.log();
  console.log(
    `To create a ZXP archive, use ${chalk.cyan('yarn run archive')}.`
  );
  console.log();
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
  buildMessages,
  getSettings,
};
