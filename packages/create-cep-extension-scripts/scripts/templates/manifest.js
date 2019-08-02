module.exports = function({
  bundleName = 'My Extension',
  bundleId = 'com.test.test.extension',
  version = '1.0.0',
  hosts,
  bundleVersion = '1.0.0',
  cepVersion = '6.0',
  uiType = 'Panel',
  width = '500',
  height = '500',
  cefParams = [
    '--allow-file-access-from-files',
    '--allow-file-access',
    '--enable-nodejs',
    '--mixed-context',
  ],
  icon: { normal = '', rollover = '', darkNormal = '', darkRollover = '' },
}) {
  var commandLineParams = cefParams.map(
    cefParam => `<Parameter>${cefParam}</Parameter>`
  );

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ExtensionManifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ExtensionBundleId="${bundleId}" ExtensionBundleName="${bundleName}" ExtensionBundleVersion="${bundleVersion}" Version="${cepVersion}">
  <ExtensionList>
    <Extension Id="${bundleId}" Version="${version}"/>
  </ExtensionList>
  <ExecutionEnvironment>
    <HostList>
      ${hosts
        .map(host => `<Host Name="${host.name}" Version="${host.version}" />`)
        .join('\n      ')}
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
          <MainPath>./index.html</MainPath>
          <CEFCommandLine>
            ${commandLineParams.join('\n            ')}
          </CEFCommandLine>
        </Resources>
        <Lifecycle>
          <AutoVisible>true</AutoVisible>
        </Lifecycle>
        <UI>
          <Type>${uiType}</Type>
          <Menu>${bundleName}</Menu>
          <Geometry>
            <Size>
              <Height>${height}</Height>
              <Width>${width}</Width>
            </Size>
          </Geometry>
          <Icons>
            <Icon Type="Normal">${normal}</Icon>
            <Icon Type="RollOver">${rollover}</Icon>
            <Icon Type="DarkNormal">${darkNormal}</Icon>
            <Icon Type="DarkRollOver">${darkRollover}</Icon>
          </Icons>
        </UI>
      </DispatchInfo>
    </Extension>
  </DispatchInfoList>
</ExtensionManifest>`;
};
