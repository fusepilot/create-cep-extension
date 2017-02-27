let csi
let bridge

try {
  csi = require('exports-loader?CSInterface,SystemPath!../vendor/CSInterface')
  bridge = new csi.CSInterface()
} catch(error) {
  console.warn(`Couldn't load CSInterface.`)
}

export function loadExtendscript(fileName) {
  if (!bridge) return console.error('Bridge not loaded.')

  const extensionRoot = bridge.getSystemPath(csi.SystemPath.EXTENSION) + "/extendscript/";
  return new Promise(function(resolve, reject) {
    bridge.evalScript('$.evalFile("' + extensionRoot + fileName + '")', function (result) {
      if (!result || result === 'undefined') return resolve()

      try {
        result = JSON.parse(result)
      } catch(err) {}

      resolve(result)
    })
  })
}

export function evalExtendscript(code, options) {
  if (!bridge) return console.error('Bridge not loaded.')
  if (!options) options = {}

  return new Promise(function(resolve, reject) {
    const doEvalScript = function () {
      bridge.evalScript(code, function(result) {
        if (!result || result === 'undefined') return resolve()

        try {
          result = JSON.parse(result)
        } catch(err) {}

        resolve(result)
      })
    }

    if (option.async) {
      setTimeout(f, 0)
    } else {
      doEvalScript()
    }
  })
}

export function listenToThemeChanges(callback) {
  if (!bridge) return console.error('Bridge not loaded.')
  
  bridge.addEventListener(csi.THEME_COLOR_CHANGED_EVENT, callback)
}

export function openURLInDefaultBrowser(url) {
  if (bridge) {
    bridge.openURLInDefaultBrowser(url)
  } else {
    window.open(url)
  }
}