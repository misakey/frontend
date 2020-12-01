import path from '@misakey/helpers/path';
import isFunction from '@misakey/helpers/isFunction';

// CONSTANTS
const HAS_CLIPBOARD = navigator.clipboard;
const HAS_READ = HAS_CLIPBOARD && isFunction(navigator.clipboard.read);

// HELPERS
const clipboardItemsPath = path(['clipboardData', 'items']);

/**
 * @param {ClipboardEvent} e paste event
 * @returns {DataTransferItemList} list of DataTransferItem,
 * see https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
 * also https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent/clipboardData
 * and https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/read
 */
export default (e) => (HAS_READ
  ? navigator.clipboard.read()
  : Promise.resolve(clipboardItemsPath(e)));
