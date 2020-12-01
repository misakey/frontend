import isArray from '@misakey/helpers/isArray';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import head from '@misakey/helpers/head';
import intersection from '@misakey/helpers/intersection';

// CONSTANTS
const FILE_KIND = 'file';

// HELPERS
export default (items, types) => {
  if (items instanceof DataTransferItemList) {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (types.includes(item.type)) {
        return item.kind === FILE_KIND
          ? item.getAsFile()
          : item.getAsString();
      }
    }
  }
  if (isArray(items)) {
    const item = head(items);
    const { types: itemTypes, getType } = item;
    if (!isNil(itemTypes) && isFunction(getType)) {
      const type = head(intersection(types, itemTypes));
      if (!isNil(type)) {
        return item.getType(type);
      }
    }
  }
  return null;
};
