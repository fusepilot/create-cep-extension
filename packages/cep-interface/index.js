export var SystemPath = {
  USER_DATA: 'userData',
  COMMON_FILES: 'commonFiles',
  MY_DOCUMENTS: 'myDocuments',
  APPLICATION: 'application',
  EXTENSION: 'extension',
  HOST_APPLICATION: 'hostApplication',
};

export function inCEPEnvironment() {
  return !!window.__adobe_cep__;
}

export function getHostEnvironment() {
  return JSON.parse(window.__adobe_cep__.getHostEnvironment());
}

export function addEventListener(type, listener, obj) {
  window.__adobe_cep__.addEventListener(type, listener, obj);
}

export function removeEventListener(type, listener, obj) {
  window.__adobe_cep__.removeEventListener(type, listener, obj);
}

export function requestOpenExtension(extensionId, params) {
  window.__adobe_cep__.requestOpenExtension(extensionId, params);
}

export function dispatchEvent(event) {
  if (_typeof(event.data) == 'object') {
    event.data = JSON.stringify(event.data);
  }

  window.__adobe_cep__.dispatchEvent(event);
}

export function closeExtension() {
  window.__adobe_cep__.closeExtension();
}

export function getExtensions(extensionIds) {
  var extensionIdsStr = JSON.stringify(extensionIds);
  var extensionsStr = window.__adobe_cep__.getExtensions(extensionIdsStr);

  var extensions = JSON.parse(extensionsStr);
  return extensions;
}

export function getNetworkPreferences() {
  var result = window.__adobe_cep__.getNetworkPreferences();
  var networkPre = JSON.parse(result);

  return networkPre;
}

export function getCurrentApiVersion() {
  return JSON.parse(window.__adobe_cep__.getCurrentApiVersion());
}

export function openURLInDefaultBrowser(url) {
  if (inCEPEnvironment()) {
    cep.util.openURLInDefaultBrowser(url);
  } else {
    window.open(url);
  }
}

export function getExtensionID() {
  return window.__adobe_cep__.getExtensionId();
}

export function registerKeyEventsInterest(keyEventsInterest) {
  return window.__adobe_cep__.registerKeyEventsInterest(keyEventsInterest);
}

export function setWindowTitle(title) {
  window.__adobe_cep__.invokeSync('setWindowTitle', title);
}

export function getWindowTitle() {
  return window.__adobe_cep__.invokeSync('getWindowTitle', '');
}

export function getOSInformation() {
  var userAgent = navigator.userAgent;

  if (navigator.platform == 'Win32' || navigator.platform == 'Windows') {
    var winVersion = 'Windows platform';
    if (userAgent.indexOf('Windows NT 5.0') > -1) {
      winVersion = 'Windows 2000';
    } else if (userAgent.indexOf('Windows NT 5.1') > -1) {
      winVersion = 'Windows XP';
    } else if (userAgent.indexOf('Windows NT 5.2') > -1) {
      winVersion = 'Windows Server 2003';
    } else if (userAgent.indexOf('Windows NT 6.0') > -1) {
      winVersion = 'Windows Vista';
    } else if (userAgent.indexOf('Windows NT 6.1') > -1) {
      winVersion = 'Windows 7';
    } else if (userAgent.indexOf('Windows NT 6.2') > -1) {
      winVersion = 'Windows 8';
    }

    var winBit = '32-bit';
    if (userAgent.indexOf('WOW64') > -1) {
      winBit = '64-bit';
    }

    return winVersion + ' ' + winBit;
  } else if (
    navigator.platform == 'MacIntel' ||
    navigator.platform == 'Macintosh'
  ) {
    var agentStr = new String();
    agentStr = userAgent;
    var verLength = agentStr.indexOf(')') - agentStr.indexOf('Mac OS X');
    var verStr = agentStr.substr(agentStr.indexOf('Mac OS X'), verLength);
    var result = verStr.replace('_', '.');
    result = result.replace('_', '.');
    return result;
  }

  return 'Unknown Operation System';
}

export function getSystemPath(pathType) {
  var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
  var OSVersion = getOSInformation();
  if (OSVersion.indexOf('Windows') >= 0) {
    path = path.replace('file:///', '');
  } else if (OSVersion.indexOf('Mac') >= 0) {
    path = path.replace('file://', '');
  }
  return path;
}

function evalScript(script, callback) {
  if (callback === null || callback === undefined) {
    callback = function callback(result) {};
  }
  window.__adobe_cep__.evalScript(script, callback);
}

export function loadExtendscript(fileName) {
  var extensionRoot = getSystemPath(SystemPath.EXTENSION) + '/extendscript/';
  return new Promise(function(resolve, reject) {
    evalScript('$.evalFile("' + extensionRoot + fileName + '")', function(
      result
    ) {
      if (!result || result === 'undefined') return resolve();

      try {
        result = JSON.parse(result);
      } catch (err) {}

      resolve(result);
    });
  });
}

export function evalExtendscript(code, options) {
  if (!inCEPEnvironment()) console.warn('Not in CEP environment.');
  if (!options) options = {};

  return new Promise(function(resolve, reject) {
    var doEvalScript = function() {
      evalScript(code, function(result) {
        if (!result || result === 'undefined') return resolve();

        try {
          result = JSON.parse(result);
        } catch (err) {}

        resolve(result);
      });
    };

    if (options.async) {
      setTimeout(f, 0);
    } else {
      doEvalScript();
    }
  });
}
