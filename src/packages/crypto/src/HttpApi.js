/*
 * Note that for some parameters
 * the name we use in JS is not the same one as the the name in the HTTP API
 * (even taking case translation into account)
 * examples: ownerId = owner_user_id, channel = data_channel ...
 * the names we use are more concise.
 * We can change this if it creates too many problems.
*/


import API from '@misakey/api';
import isString from '@misakey/helpers/isString';
import isArray from '@misakey/helpers/isArray';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import objectToCamelCase from './helpers/objectToCamelCase';
import assertNotAnyNil from './helpers/assertNotAnyNil';

// helpers functions

async function httpCallReturnBody(endpoint, httpRequestParams) {
  const { params, payload, queryParams } = httpRequestParams;
  const response = await API
    .use(endpoint)
    .build(
      // @FIXME are we sure we always want snake_case on payload and query params
      // and camelCase on params?
      params,
      payload ? objectToSnakeCase(payload) : payload,
      queryParams ? objectToSnakeCase(queryParams) : queryParams,
    )
    .send();
  return response;
}

// exported functions

export async function setOwnerPublicKey(ownerId, publicKey) {
  assertNotAnyNil({ ownerId, publicKey });

  const endpoint = {
    method: 'POST',
    path: '/users/:ownerId/pubkey',
    auth: true,
  };
  const httpRequestParams = {
    params: { ownerId },
    payload: {
      pubkey: publicKey,
    },
  };

  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  // caller will probably not care about the response,
  // but we return it anyway
  return objectToCamelCase(responseBody);
}

export async function postChannels(channels) {
  if (!isArray(channels)) { throw Error('param "channel" must be an array'); }
  const endpoint = {
    method: 'POST',
    path: '/data-channels',
    auth: true,
  };
  const httpRequestParams = {
    payload: channels,
  };
  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  return objectToCamelCase(responseBody);
}

export async function getChannels(ownerId) {
  // required parameter
  assertNotAnyNil({ ownerId });
  const endpoint = {
    method: 'GET',
    path: '/data-channels',
    auth: true,
  };
  const httpRequestParams = {
    params: {
      ownerUserId: ownerId,
    },
  };
  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  return objectToCamelCase(responseBody);
}

export async function postCryptograms(cryptogramsWithMetadata) {
  const payload = cryptogramsWithMetadata.map(([cryptogram, cryptogramMetadata]) => {
    const { dataChannelId, producerApplicationId, dataTimestamp, inputSource } = cryptogramMetadata;
    assertNotAnyNil({ dataChannelId, producerApplicationId, dataTimestamp, inputSource });
    if (!isString(cryptogram)) {
      throw Error('cryptogram is not a string (missing base64 encoding?)', cryptogramMetadata);
    }

    return {
      content: cryptogram,
      ...objectToSnakeCase(cryptogramMetadata),
    };
  });

  const endpoint = {
    method: 'POST',
    path: '/cryptograms',
    auth: true,
  };
  const httpRequestParams = {
    payload,
  };
  return httpCallReturnBody(endpoint, httpRequestParams);
}

export async function getCryptograms(ownerId, datatypes, fromDatetime, toDatetime) {
  // we are being more strict than the HTTP API here,
  // only "ownerId" is really required
  // we might change this later
  assertNotAnyNil({ ownerId, datatypes, fromDatetime, toDatetime });

  const endpoint = {
    method: 'GET',
    path: '/cryptograms',
    auth: true,
  };
  const httpRequestParams = {
    params: {
      ownerId,
      datatypes,
      fromDatetime,
      toDatetime,
    },
  };
  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  return objectToCamelCase(responseBody);
}

export async function updateSecretsBackup(ownerId, secretBackup) {
  assertNotAnyNil({ ownerId, secretBackup });

  const endpoint = {
    method: 'PUT',
    path: '/users/:ownerId/backup',
    auth: true,
  };
  const httpRequestParams = {
    params: { ownerId },
    payload: {
      data: secretBackup,
    },
  };
  await httpCallReturnBody(endpoint, httpRequestParams);
}

export async function getSecretsBackup(ownerId) {
  assertNotAnyNil({ ownerId });

  const endpoint = {
    method: 'GET',
    path: '/users/:ownerId/backup',
    auth: true,
  };
  const httpRequestParams = {
    params: { ownerId },
  };

  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  return responseBody.data;
}
