module.exports = function (
	bundleId = 'com.test.test.extension',
	appIds = ['AEFT']
) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
  <Extension Id="${bundleId}">
  <HostList>
    ${appIds.map((appId, i) => `<Host Name="${appId}" Port="${'' + (3000 + i + 1)}" />`).join('\n    ')}
  </HostList>
  </Extension>
</ExtensionList>`
}
