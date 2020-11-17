import { RESTRICTION_TYPES, LIMITED_RESTRICTION_TYPES } from 'constants/app/boxes/accesses';
import { PRIVATE, LIMITED, PUBLIC } from '@misakey/ui/constants/accessLevels';
import { ACCESS_RM, ACCESS_ADD } from 'constants/app/boxes/events';

import sort from '@misakey/helpers/sort';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import pathEq from '@misakey/helpers/pathEq';
import filterRamda from '@misakey/helpers/filter/ramda';
import groupBy from '@misakey/helpers/groupBy';
import differenceWith from '@misakey/helpers/differenceWith';

// CONSTANTS
const SORT_VALUES = {
  [RESTRICTION_TYPES.EMAIL_DOMAIN]: -1,
  [RESTRICTION_TYPES.IDENTIFIER]: 1,
};

// HELPERS
const restrictionTypePathEq = pathEq(['content', 'restrictionType']);

export const getRestrictions = (accesses) => pluck('content', accesses);

const sorter = ({ restrictionType: rTa }, { restrictionType: rTb }) => {
  const rTaValue = SORT_VALUES[rTa];
  const rTbValue = SORT_VALUES[rTb];
  return rTbValue - rTaValue;
};

export const sortRestrictionsByType = sort(sorter);

export const filterByRestrictionType = (type) => filterRamda(restrictionTypePathEq(type));

export const getEmailDomainAccesses = filterByRestrictionType(RESTRICTION_TYPES.EMAIL_DOMAIN);

export const getIsPublic = (accesses) => {
  const restrictions = getRestrictions(accesses);
  return restrictions
    .some(({ restrictionType }) => restrictionType === RESTRICTION_TYPES.INVITATION_LINK);
};

export const getIsPrivate = (
  accesses,
) => isEmpty(accesses);

export const getIsLimited = (accesses) => {
  const restrictions = getRestrictions(accesses);
  return restrictions
    .some(({ restrictionType }) => LIMITED_RESTRICTION_TYPES.includes(restrictionType));
};

export const getRestrictionStatus = ({ accesses }) => {
  if (isNil(accesses)) {
    return null;
  }
  if (getIsPrivate(accesses)) {
    return PRIVATE;
  }
  if (getIsLimited(accesses)) {
    return LIMITED;
  }
  // expected that if not limited, nor private, it's public
  return PUBLIC;
};

export const getUpdatedAccesses = (accesses, response) => {
  const {
    [ACCESS_RM]: eventsToRemove = [],
    [ACCESS_ADD]: eventsToAdd = [],
  } = groupBy(response, 'type');
  const cleanedAccesses = differenceWith(
    accesses,
    eventsToRemove,
    (initialEvent, rmEvent) => initialEvent.id === rmEvent.referrerId,
  );
  return cleanedAccesses.concat(eventsToAdd);
};
