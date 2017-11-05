module.exports = function(bundleId = 'com.test.extension', hosts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
  <Extension Id="${bundleId}">
  <HostList>
    ${hosts
      .map(
        (host, i) =>
          `<Host Name="${host.name.trim()}" Port="${'' + (3000 + i + 1)}" />`
      )
      .join('\n    ')}
  </HostList>
  </Extension>
</ExtensionList>`;
};
