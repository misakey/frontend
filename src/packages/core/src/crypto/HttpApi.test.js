import {
  postChannels,
} from './HttpApi';

import {
  buildJsonResponse,
} from './testHelpers/http';

// test suite setup/teardown

beforeAll(() => {
  jest.spyOn(global, 'fetch');
});

beforeEach(() => {
  fetch.mockReset();
});

afterAll(() => {
  fetch.mockRestore();
});

// end of setup/teardown

it('makes a valid HTTP call to post channels', async () => {
  fetch.mockResolvedValue(buildJsonResponse([{ id: 3 }]));

  const channel = {
    owner_user_id: 'owner123',
    datatype: 'unclassified_purchase',
    public_key: 'Z5ldqyjudvkpT5cYwUTtFEwht3pxBCd1rIClEv61OzU=',
  };
  await postChannels([channel]);

  expect(global.fetch).toHaveBeenCalledTimes(1);
});
