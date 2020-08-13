// transform FileList Prototype into Array to have access to .map
// NB: FileList API does not allow .map => https://developer.mozilla.org/en-US/docs/Web/API/FileList
export default (fileList) => {
  if (fileList instanceof FileList) {
    return [...fileList];
  }
  return fileList;
};
