module.exports = function() {
  require('dotenv').config()

  return {
    name: process.env.EXTENSION_NAME,
    password: process.env.EXTENSION_CERTIFICATE_PASSWORD,
    certificate: process.env.EXTENSION_CERTIFICATE,
    bundle_id: process.env.EXTENSION_BUNDLE_ID,
    bundle_version: process.env.EXTENSION_BUNDLE_VERSION,
    cep_version: process.env.EXTENSION_CEP_VERSION,
    panel_width: process.env.EXTENSION_PANEL_WIDTH,
    panel_height: process.env.EXTENSION_PANEL_HEIGHT,
    cef_params: process.env.EXTENSION_CEF_PARAMS,
    auto_open_remote_debugger: process.env.EXTENSION_AUTO_OPEN_REMOTE_DEBUGGER,
    enable_playerdebugmode: process.env.EXTENSION_ENABLE_PLAYERDEBUGMODE,
    tail_logs: process.env.EXTENSION_TAIL_LOGS,
    app_ids: process.env.EXTENSION_APP_IDS || 'AEFT',
  }
}