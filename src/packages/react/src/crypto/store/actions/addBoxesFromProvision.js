import { batch } from 'react-redux';

import setBoxSecrets from './setBoxSecrets';

export default ({ boxesSecret }) => (
  (dispatch) => {
    batch(() => {
      boxesSecret.forEach(({ boxId, secretKey, keyShare }) => {
        dispatch(setBoxSecrets({ boxId, secretKey, keyShare }));
      });
    });
  }
);
