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

/**
 * When error and contentType different from application/json
 */
export function receiveGatewayError(middlewares) {
  const endpoint = API.use(API.endpoints.application.find).setMiddlewares(middlewares);

  return endpoint.fakeResponse(401)
    .then((rawResponse) => handleResponse(rawResponse, endpoint.middlewares));
}

describe('API send method', () => {
  it('throws when getting from nowhere', async () => {
    expect.assertions(1);
    await getNowhere().catch((e) => expect(e).toBeTruthy());
  });
  it('handles responses with a success status', async () => {
    expect.assertions(1);
    await receiveSuccess().then((data) => expect(data).toBeTruthy());
  });
  it('handles responses with an error status', async () => {
    expect.assertions(1);
    await receiveError().catch((e) => expect(e.code).toEqual('{Code}'));
  });
  it('calls middlewares', async () => {
    expect.assertions(1);
    let status = null;
    const middleware = (rawResponse) => {
      status = rawResponse.status;

      return rawResponse;
    };

    await receiveGatewayError([middleware])
      .then((rawResponse) => expect(status).toEqual(rawResponse.status));
  });
});
