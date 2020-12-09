import { batch } from 'react-redux';

export default (fn) => new Promise((resolve, reject) => {
  batch(async () => {
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
});
