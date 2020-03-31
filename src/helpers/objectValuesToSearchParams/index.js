import fromPairs from '@misakey/helpers/fromPairs';

export default (object, searchKey) => {
  const searchParamPairs = Object.values(object)
    .map((value) => ([
      value,
      { [searchKey]: value },
    ]));
  return fromPairs(searchParamPairs);
};
