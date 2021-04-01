function urlSearchParamsToObject(urlSearchParams) {
  const object = {};

  urlSearchParams.forEach((value, key) => {
    object[key] = value;
  });

  return object;
}

export default urlSearchParamsToObject;
