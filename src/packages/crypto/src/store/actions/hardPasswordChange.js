import { createNewOwnerSecrets } from './concrete';

export default function hardPasswordChange(newPassword) {
  return async (dispatch) => {
    const {
      backupData,
      pubkeyData,
      backupKey,
    } = await dispatch(createNewOwnerSecrets(newPassword));

    return {
      backupKey,
      backupData,
      pubkeys: {
        userPubkey: pubkeyData,
      },
    };
  };
}
