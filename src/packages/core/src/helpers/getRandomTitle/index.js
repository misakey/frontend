import capitalize from '@misakey/core/helpers/capitalize';
import LAND_PRODUCTS from './lists/landProducts';
import ADJECTIVES from './lists/adjectives';

// HELPERS

const getRandomAdjective = () => {
  const random = Math.floor(Math.random() * ADJECTIVES.length);
  return ADJECTIVES[random];
};
const getRandomLandProduct = () => {
  const random = Math.floor(Math.random() * LAND_PRODUCTS.length);
  return LAND_PRODUCTS[random];
};

export default () => capitalize(`${getRandomAdjective()} ${getRandomLandProduct()}`);
