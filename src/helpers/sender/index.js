import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

// HELPERS
export const identifierValueProp = prop('identifierValue');
const idProp = prop('id');

export const senderMatchesIdentityId = (sender, identityId) => {
  const senderIdentityId = idProp(sender);
  return (!isNil(senderIdentityId) && senderIdentityId === identityId);
};

export const sendersMatch = (
  senderA, senderB,
) => (!isNil(senderB) && senderMatchesIdentityId(senderA, senderB.id));


export const senderMatchesIdentifierValue = (sender, identifierValue) => {
  const senderIdentifierValue = identifierValueProp(sender);
  return senderIdentifierValue === identifierValue;
};

export const sendersIdentifiersMatch = (
  senderA, senderB,
) => (!isNil(senderB) && senderMatchesIdentifierValue(senderA, identifierValueProp(senderB)));
