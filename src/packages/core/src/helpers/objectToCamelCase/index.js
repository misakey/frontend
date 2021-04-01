import camelCase from '../camelCase';

const objectToCamelCase = (o) => {
  const newObject = {};

  Object.keys(o).forEach((key) => {
    newObject[camelCase(key)] = o[key];
  });

  return newObject;
};

export default objectToCamelCase;
