// Some code needed when running unit tests involving HTTP calls

import API from '@misakey/api';

API.setToken('fakeTokenForTests');

// package "API" requires this variable to be set
// In Unit tests, there is no need to have a server running at this address
window.env = {
  API_ENDPOINT: 'http://localhost:5064',
};

export function buildJsonResponse(jsonData) {
  return new Response(
    new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' }),
  );
}
