import { RESTRICTION_TYPES } from '@misakey/core/api/constants/boxes/accesses';
import { ACCESS_RM, ACCESS_ADD } from '@misakey/core/api/constants/boxes/events';

import sort from '@misakey/core/helpers/sort';
import pluck from '@misakey/core/helpers/pluck';
import pathEq from '@misakey/core/helpers/pathEq';
import filterRamda from '@misakey/core/helpers/filter/ramda';
import groupBy from '@misakey/core/helpers/groupBy';
import differenceWith from '@misakey/core/helpers/differenceWith';

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
