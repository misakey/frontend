import getTargetOrCurrentTarget from '@misakey/helpers/event/targetOrCurrentTarget/get';
import fileListToArray from '@misakey/helpers/fileListToArray';

// transform FileList Prototype into Array to have access to .map
// NB: FileList API does not allow .map => https://developer.mozilla.org/en-US/docs/Web/API/FileList
export default (e) => {
  const { files } = getTargetOrCurrentTarget(e);
  return fileListToArray(files);
};
