import isArray from '@misakey/core/helpers/isArray';
import isObject from '@misakey/core/helpers/isObject';
import omit from '@misakey/core/helpers/omit';
import prop from '@misakey/core/helpers/prop';
import props from '@misakey/core/helpers/props';
import mergeAll from '@misakey/core/helpers/mergeAll';

const mergeClasses = (keys, classes) => {
  const toMerge = props(keys, classes);
  return mergeAll(toMerge);
};

export default (classes, keyOrKeys, omitKeyOrKeys = []) => {
  // opti to avoid merging if keyOrKeys is not an array
  const childClasses = isArray(keyOrKeys)
    ? mergeClasses(keyOrKeys, classes)
    : prop(keyOrKeys, classes);

  const omitKeys = isArray(omitKeyOrKeys) ? omitKeyOrKeys : [omitKeyOrKeys];
  const keys = isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  const omittedClasses = omit(classes, omitKeys.concat(keys));

  if (isObject(childClasses)) {
    return { ...omittedClasses, ...childClasses };
  }
  return omittedClasses;
};
