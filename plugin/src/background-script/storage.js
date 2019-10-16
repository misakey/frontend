import log from '@misakey/helpers/log';

export async function setItem(key, value) {
  try {
    await browser.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    log(`Fail to set storage value: ${error}`);
    return false;
  }
}

export async function getItem(key) {
  return browser.storage.local.get(key);
}
