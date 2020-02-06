import isNil from '@misakey/helpers/isNil';

const allowedKeys = [
  `oidc.user:${window.env.AUTH.authority}:${window.env.AUTH.client_id}`,
  'i18nextLng',
  'persist:root',
];
const port = browser.runtime.connect({ name: 'misakey-cs' });

function getLocalStorage() {
  return allowedKeys.reduce((misakeyLocalStorage, key) => {
    const foundValue = localStorage.getItem(key);
    if (!isNil(foundValue)) {
      return {
        ...misakeyLocalStorage,
        [key]: foundValue,
      };
    }
    return misakeyLocalStorage;
  }, {});
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
