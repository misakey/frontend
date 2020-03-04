import askForPassword from './askForPassword';
import { importKeys } from './concrete';

export default function importSecrets(file, openPasswordPrompt) {
  return async (dispatch) => {
    await dispatch(askForPassword(openPasswordPrompt));
    const data = JSON.parse(await file.text());
    return dispatch(importKeys(data));
  };
}
