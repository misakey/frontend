import API from '@misakey/api';
import { handleResponse } from '@misakey/api/Endpoint/send';

window.env = {
  API_ENDPOINT: 'https://api.misakey.com.local',
};

export function getNowhere() {
  const endpoint = {
    method: 'GET',
    path: '/',
  };

  return API.use(endpoint).build(
    undefined,
    undefined,
    undefined,
    'http://nowhere',
  ).send();
}

/**
 * Successful responses (200–299),
 */
export function receiveSuccess() {
  return API.use(API.endpoints.application.find)
    .fakeResponse(200)
    .then((rawResponse) => handleResponse(rawResponse));
}

/**
 * Redirects (300–399),
 * Client errors (400–499),
 * and Server errors (500–599).
 */
export function receiveError() {
  return API.use(API.endpoints.application.find)
    .fakeResponse(500)
    .then((rawResponse) => handleResponse(rawResponse));
}

describe('API handleResponse method', () => {
  it('throws when getting from nowhere', async () => {
    expect.assertions(1);
    await expect(getNowhere()).rejects.toBeTruthy();
  });
  it('handles responses with a success status', async () => {
    expect.assertions(1);
    await expect(receiveSuccess()).resolves.not.toThrow();
  });
  it('handles responses with an error status', async () => {
    expect.assertions(1);
    await expect(receiveError()).rejects.toEqual(expect.objectContaining({
      code: '{Code}',
    }));
  });
});
