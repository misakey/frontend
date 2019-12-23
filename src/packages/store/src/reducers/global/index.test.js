import { UPDATE_GLOBAL_STATE } from '../../actions/global';
import reducer from './index';

describe('testing global reducer', () => {
  const initialState = {
    isBetaDisclaimerApproved: null,
  };
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });
  it('should handle UPDATE_GLOBAL_STATE', () => {
    const nextState = { isBetaDisclaimerApproved: true };
    expect(reducer(initialState, { type: UPDATE_GLOBAL_STATE, ...nextState })).toEqual(nextState);
  });
});
