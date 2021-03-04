import { sendersMatch } from 'helpers/sender';

export const filterCreatorSubjectFromMembers = ({ members, creator, subject }) => (members || [])
  .filter((member) => !sendersMatch(member, creator) && !sendersMatch(member, subject));
