import { sendersMatch, senderMatchesIdentityId } from 'helpers/sender';

export const filterCreatorSubjectFromMembers = ({ members, creator, subject }) => (members || [])
  .filter((member) => !sendersMatch(member, creator) && !sendersMatch(member, subject));

export const filterSelfFromMembers = (members, meIdentityId) => (members || [])
  .filter((member) => !senderMatchesIdentityId(member, meIdentityId));
