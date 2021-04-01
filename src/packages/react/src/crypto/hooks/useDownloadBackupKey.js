import moment from 'moment';

import { DATETIME_FILE_HUMAN_READABLE } from '@misakey/ui/constants/formats/dates';

import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';

import { serializeObjectToJson } from '@misakey/core/crypto/helpers/serialization';
import downloadFile from '@misakey/core/helpers/downloadFile';

import { useSelector } from 'react-redux';
import { useCallback } from 'react';

// CONSTANTS
const { getRootKey } = cryptoSelectors;

// TODO IN THIS MR download root key instead
export default (fileNamePrefix) => {
  const rootKey = useSelector(getRootKey);

  return useCallback(
    () => {
      const date = moment().format(DATETIME_FILE_HUMAN_READABLE);

      const file = serializeObjectToJson({
        rootKey,
      });

      return downloadFile(
        file,
        `${fileNamePrefix}-${date}.json`,
      );
    },
    [rootKey, fileNamePrefix],
  );
};
