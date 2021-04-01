import getTargetOrCurrentTarget from '@misakey/core/helpers/event/targetOrCurrentTarget/get';
import fileListToArray from '@misakey/core/helpers/fileListToArray';

// transform FileList Prototype into Array to have access to .map
// NB: FileList API does not allow .map => https://developer.mozilla.org/en-US/docs/Web/API/FileList
export default (e) => {
  const { files } = getTargetOrCurrentTarget(e);
  return fileListToArray(files);
};
