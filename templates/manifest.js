module.exports = function ({
  bundleName = 'My Extension',
  bundleId = 'com.test.test.extension',
  bundleAppIds = 'AEFT',
  bundleAppVersions = '[13.0,15.9]',
  bundleVersion = '1.0.0',
  cepVersion = '6.0',
  width = '500',
  height = '500',
  cefParams = ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context']
}) {
  var commandLineParams = cefParams.map(cefParam => `<Parameter>${cefParam}</Parameter>`)
  var appIds = Array.isArray(bundleAppIds) ? bundleAppIds : [bundleAppIds]
  var appVersions = Array.isArray(bundleAppVersions) ? bundleAppVersions : [bundleAppVersions]
  var hosts = appIds.map((host, i) => `<Host Name="${host}" Version="${appVersions[i]}" />`)

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ExtensionManifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ExtensionBundleId="${bundleId}" ExtensionBundleName="${bundleName}" ExtensionBundleVersion="${bundleVersion}" Version="${cepVersion}">
  <ExtensionList>
    <Extension Id="${bundleId}" Version="${bundleVersion}"/>
  </ExtensionList>
  <ExecutionEnvironment>
    <HostList>
      ${hosts.join('\n      ')}
    </HostList>
    <LocaleList>
      <Locale Code="All"/>
    </LocaleList>
    <RequiredRuntimeList>
      <RequiredRuntime Name="CSXS" Version="${cepVersion}"/>
    </RequiredRuntimeList>
  </ExecutionEnvironment>
  <DispatchInfoList>
    <Extension Id="${bundleId}">
      <DispatchInfo>
        <Resources>
          <MainPath>./panel.html</MainPath>
          <CEFCommandLine>
            ${commandLineParams.join('\n            ')}
          </CEFCommandLine>
        </Resources>
        <Lifecycle>
          <AutoVisible>true</AutoVisible>
        </Lifecycle>
        <UI>
          <Type>Panel</Type>
          <Menu>${bundleName}</Menu>
          <Geometry>
            <Size>
              <Height>${width}</Height>
              <Width>${height}</Width>
            </Size>
          </Geometry>
        </UI>
      </DispatchInfo>
    </Extension>
  </DispatchInfoList>
</ExtensionManifest>`
}
