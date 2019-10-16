
export async function getCurrentTab() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  return tabs[0] || null;
}

export async function getTab(tabId) {
  const tab = await browser.tabs.get(tabId);
  return tab || null;
}
