import isNil from '@misakey/helpers/isNil';

export default function assertNotAnyNil(params) {
  Object.entries(params).forEach(([name, value]) => {
    if (isNil(value)) {
      throw Error(`${name} is nil`);
    }
  });
}
