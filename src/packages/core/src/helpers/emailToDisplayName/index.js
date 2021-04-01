import capitalize from '@misakey/core/helpers/capitalize';

// CONSTANTS
const DOMAIN_REGEX = /@.*$/;
const DOTS_REGEX = /\./g;

// HELPERS
// NB: backend algorithm reproduced
export default (email) => {
  const words = email.replace(DOMAIN_REGEX, '').replace(DOTS_REGEX, ' ').split(' ');
  const capitalWords = words.map(capitalize);
  return capitalWords.join(' ');
};
