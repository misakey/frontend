
// HELPERS
const defaultMapError = (index) => (error) => ({ error, index });

export default (promises, mapError = defaultMapError) => Promise.all(
  promises
    .map((promise, index) => promise.catch(mapError(index))),
);
