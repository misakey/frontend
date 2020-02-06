function informWebappOfInstalledVersion() {
  const divPluginVersion = document.createElement('div');
  divPluginVersion.id = 'ExtensionCheck_Misakey';
  const attributeVersion = document.createAttribute('data-plugin-version');
  attributeVersion.value = browser.runtime.getManifest().version;
  divPluginVersion.setAttributeNode(attributeVersion);
  window.document.body.appendChild(divPluginVersion);
}

informWebappOfInstalledVersion();
