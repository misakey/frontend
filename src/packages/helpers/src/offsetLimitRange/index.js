
import min from '@misakey/helpers/min';
import range from '@misakey/helpers/range';

export const makeRangeFromOffsetLimit = ({ offset, limit }) => range(offset, offset + limit);

export const makeOffsetLimitFromRange = (rangeList) => {
  const offset = min(rangeList);
  const limit = rangeList.length;
  return {
    offset,
    limit,
  };
};
