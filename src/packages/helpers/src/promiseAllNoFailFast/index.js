
// HELPERS
const defaultMapError = (error) => ({ error });

export default (promises, mapError = defaultMapError) => Promise.all(
  promises
    .map((promise) => promise.catch(mapError)),
);
