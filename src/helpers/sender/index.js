import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';

export const identifierValuePath = path(['identifier', 'value']);

export const sendersMatch = (senderA, senderB) => {
  const identifierValueA = identifierValuePath(senderA);
  const identifierValueB = identifierValuePath(senderB);

  return !isNil(identifierValueA) && identifierValueA === identifierValueB;
};

export const senderMatchesIdentifierValue = ({ sender, identifierValue }) => {
  const senderIdentifierValue = identifierValuePath(sender);

  return !isNil(senderIdentifierValue) && senderIdentifierValue === identifierValue;
};

export const senderIdMatchesIdentityId = ({ senderId }, identityId) => senderId === identityId;
