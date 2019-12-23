import snakeCase from '../snakeCase';

const objectToSnakeCase = (o) => {
  const newObject = {};

  Object.keys(o).forEach((key) => {
    newObject[snakeCase(key)] = o[key];
  });

  return newObject;
};

export default objectToSnakeCase;
