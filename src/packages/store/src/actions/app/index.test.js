import { RESET_APP, resetApp } from './index';

describe('testing app actions', () => {
  it('should create a RESET_APP action', () => {
    expect(resetApp()).toEqual({ type: RESET_APP });
  });
});
