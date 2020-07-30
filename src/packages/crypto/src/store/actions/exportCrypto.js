import moment from 'moment';
import downloadFile from '@misakey/helpers/downloadFile';

import { DATETIME_FILE_HUMAN_READABLE } from 'constants/formats/dates';
import NoPassword from 'constants/Errors/classes/NoPassword';

import askForPassword from './askForPassword';

export default function exportCrypto(fileNamePrefix, openPasswordPrompt) {
  return async (dispatch, getState) => {
    try {
      // askForPassword guarantees that crypto is loaded if it succeeds
      await dispatch(askForPassword(openPasswordPrompt));
      const { secrets } = getState().crypto;

      const date = moment().format(DATETIME_FILE_HUMAN_READABLE);

      return downloadFile(
        JSON.stringify(secrets),
        `${fileNamePrefix}-${date}.json`,
      );
    } catch (error) {
      if (error instanceof NoPassword) {
        return undefined;
      }
      throw error;
    }
  };
}
