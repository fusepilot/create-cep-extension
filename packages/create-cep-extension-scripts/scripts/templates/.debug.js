module.exports = function(
  bundleId = 'com.test.test.extension',
  hostNames = 'PHXS, PHSP, IDSN, AICY, ILST, PPRO, AEFT, PRLD, FLPR, DRWV'
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
  <Extension Id="${bundleId}">
  <HostList>
    ${hostNames
      .split(',')
      .map(
        (hostName, i) =>
          `<Host Name="${hostName.trim()}" Port="${'' + (3000 + i + 1)}" />`
      )
      .join('\n    ')}
  </HostList>
  </Extension>
</ExtensionList>`;
};
