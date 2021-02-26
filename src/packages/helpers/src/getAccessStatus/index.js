import {
  ACCESS_STATUS_MEMBER, ACCESS_STATUS_NEEDS_LINK, ACCESS_STATUS_INVITED, ACCESS_STATUS_OWNER,
} from '@misakey/ui/constants/accessStatus';


export default ({ isOwner, isMember, autoInvite }) => {
  if (isOwner) {
    return ACCESS_STATUS_OWNER;
  }
  if (isMember) {
    return ACCESS_STATUS_MEMBER;
  }
  if (autoInvite) {
    return ACCESS_STATUS_INVITED;
  }
  return ACCESS_STATUS_NEEDS_LINK;
};
