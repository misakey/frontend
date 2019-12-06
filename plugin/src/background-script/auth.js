export function setLocalStorage(storage) {
  localStorage.clear();
  Object.entries(storage).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
}

export function initAuthIframe() {
  const iframe = document.createElement('iframe');
  iframe.src = window.env.APP_URL;
  document.body.appendChild(iframe);
}
