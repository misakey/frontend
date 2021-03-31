import { MEMBER_LEAVE, MSG_DELETE, MSG_EDIT } from '@misakey/ui/constants/boxes/events';

import { createBoxEventBuilder } from '@misakey/api/helpers/builder/boxes';
import encryptText from '@misakey/crypto/box/encryptText';

export const createLeaveBoxEventBuilder = (id) => createBoxEventBuilder(id, {
  type: MEMBER_LEAVE,
});

export const createDeleteBoxEventBuilder = ({ boxId, referrerId }) => {
  const event = {
    type: MSG_DELETE,
    referrerId,
  };
  return createBoxEventBuilder(boxId, event);
};

export const createEditTextBoxEventBuilder = ({
  publicKey, boxId, referrerId, value,
}) => createBoxEventBuilder(boxId, {
  type: MSG_EDIT,
  content: {
    newEncrypted: encryptText(value, publicKey),
    newPublicKey: publicKey,
  },
  referrerId,
});
