/* global browser */ // eslint-disable-line no-redeclare
import isNil from '@misakey/helpers/isNil';

export function redirectToApp(path) {
  browser.tabs.create({
    url: `${window.env.APP_URL}${path}`,
  });
}

export function openInNewTab(url) {
  browser.tabs.create({ url });
}

// @FIXME: improve
export function openMailto(url) {
  setTimeout(() => {
    browser.tabs.create({ url });
  }, 1000);
}

export function downloadFileFromPlugin(blobURL, filename, onRevoke) {
  const onRevokeBlob = (delta) => {
    if (delta.state && delta.state.current === 'complete') {
      onRevoke(blobURL);
    }
  };
  if (!browser.downloads.onChanged.hasListener(onRevokeBlob)) {
    browser.downloads.onChanged.addListener(onRevokeBlob);
  }

  return browser.downloads.download({ url: blobURL, filename });
}

export function isPluginDetected() {
  return !isNil(document.getElementById('ExtensionCheck_Misakey'));
}

export async function isOnboardingDone() {
  const { onBoardingDone } = await browser.storage.sync.get('onBoardingDone');
  return onBoardingDone;
}

export async function setOnboardingDone() {
  return browser.storage.sync.set({ onBoardingDone: true });
}
