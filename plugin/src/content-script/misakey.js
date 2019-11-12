const allowedKeys = [
  `oidc.user:${window.env.AUTH.authority}:${window.env.AUTH.client_id}`,
  'i18nextLng',
  'persist:root',
];
const port = browser.runtime.connect({ name: 'misakey-cs' });

function getLocalStorage() {
  return allowedKeys.reduce((misakeyLocalStorage, key) => ({
    ...misakeyLocalStorage,
    [key]: localStorage.getItem(key),
  }), {});
}

// Triggers changes from other instance of window (tabs, iframe)
window.addEventListener('storage', (e) => {
  if (allowedKeys.includes(e.key)) {
    port.postMessage({
      action: 'syncLocalStorage',
      misakeyLocalStorage: getLocalStorage(),
    });
  }
});

// Triggers changes from current window
window.addEventListener('userHasChanged', () => {
  port.postMessage({
    action: 'syncLocalStorage',
    misakeyLocalStorage: getLocalStorage(),
  });
}, false);
