export function isDesktopDevice() {
  return !(navigator.userAgent.toLowerCase().includes('mobile')
    || navigator.userAgent.toLowerCase().includes('tablet'));
}
