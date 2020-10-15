import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

// HELPERS
export const identifierValuePath = path(['identifier', 'value']);
const identifierIdProp = prop('identifierId');

export const senderMatchesIdentifierId = (sender, identifierId) => {
  const senderIdentifierId = identifierIdProp(sender);
  return (!isNil(senderIdentifierId) && senderIdentifierId === identifierId);
};

export const sendersIdentifiersMatch = (
  senderA, senderB,
) => (!isNil(senderB) && senderMatchesIdentifierId(senderA, senderB.identifierId));
