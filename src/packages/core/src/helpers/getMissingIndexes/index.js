import isNil from '@misakey/core/helpers/isNil';

export default (paginatedMap) => Object.entries(paginatedMap)
  .reduce((acc, [key, value]) => {
    if (isNil(value)) {
      acc.push(key);
    }
    return acc;
  }, []);
