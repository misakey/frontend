import moment from 'moment';

import { DATETIME_FILE_HUMAN_READABLE } from '@misakey/ui/constants/formats/dates';

import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import { serializeObjectToJson } from '@misakey/crypto/helpers/serialization';
import downloadFile from '@misakey/helpers/downloadFile';

import { useSelector } from 'react-redux';
import { useCallback } from 'react';

// CONSTANTS
const { getBackupKey } = cryptoSelectors;

export default (fileNamePrefix) => {
  const backupKey = useSelector(getBackupKey);

  return useCallback(
    () => {
      const date = moment().format(DATETIME_FILE_HUMAN_READABLE);

      const file = serializeObjectToJson({
        backupKey,
      });

      return downloadFile(
        file,
        `${fileNamePrefix}-${date}.json`,
      );
    },
    [backupKey, fileNamePrefix],
  );
};
