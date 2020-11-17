import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

// HELPERS
export const identifierValuePath = path(['identifier', 'value']);
const identifierIdProp = prop('identifierId');
const idProp = prop('id');

export const senderMatchesIdentifierId = (sender, identifierId) => {
  const senderIdentifierId = identifierIdProp(sender);
  return (!isNil(senderIdentifierId) && senderIdentifierId === identifierId);
};

export const sendersIdentifiersMatch = (
  senderA, senderB,
) => (!isNil(senderB) && senderMatchesIdentifierId(senderA, senderB.identifierId));

export const senderMatchesIdentityId = (sender, identityId) => {
  const senderIdentityId = idProp(sender);
  return (!isNil(senderIdentityId) && senderIdentityId === identityId);
};

export const sendersMatch = (
  senderA, senderB,
) => (!isNil(senderB) && senderMatchesIdentityId(senderA, senderB.id));


export const senderMatchesIdentifierValue = (sender, identifierValue) => {
  const senderIdentifierValue = identifierValuePath(sender);
  return senderIdentifierValue === identifierValue;
};
