import { createNewOwnerSecrets } from './concrete';

export default function hardPasswordChange(newPassword) {
  return async (dispatch) => {
    const {
      backupData,
      pubkeyData,
    } = await dispatch(createNewOwnerSecrets(newPassword));

    return {
      backupData,
      pubkeys: {
        userPubkey: pubkeyData,
      },
    };
  };
}
