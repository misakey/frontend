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
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

// TODO use @misakey/helpers/objectToCamelCaseDeep instead (same exact function)
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

// TODO remove unused functions

export async function setOwnerPublicKey(ownerId, publicKey) {
  assertNotAnyNil({ ownerId, publicKey });

  const endpoint = {
    method: 'POST',
    path: '/users/:ownerId/pubkey',
    withCsrfToken: true,
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
    withCsrfToken: true,
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
    withCsrfToken: true,
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

export async function updateSecretsBackup(id, secretBackup, version) {
  assertNotAnyNil({ id, secretBackup });

  const endpoint = {
    method: 'PUT',
    path: '/accounts/:id/backup',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    params: { id },
    payload: {
      data: secretBackup,
      version,
    },
  };
  return httpCallReturnBody(endpoint, httpRequestParams);
}

export async function getEncryptedSecretsBackup(id) {
  assertNotAnyNil({ id });

  const endpoint = {
    method: 'GET',
    path: '/accounts/:id/backup',
  };
  const httpRequestParams = {
    params: { id },
  };

  return httpCallReturnBody(endpoint, httpRequestParams);
}

export async function setIdentityPublicKey(identityId, publicKey) {
  assertNotAnyNil({ identityId, publicKey });

  const endpoint = {
    method: 'PATCH',
    path: '/identities/:id',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    params: { id: identityId },
    payload: {
      pubkey: publicKey,
    },
  };

  return httpCallReturnBody(endpoint, httpRequestParams);
}


export async function setIdentityNonIdentifiedPublicKey(identityId, publicKey) {
  assertNotAnyNil({ identityId, publicKey });

  const endpoint = {
    method: 'PATCH',
    path: '/identities/:id',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    params: { id: identityId },
    payload: {
      nonIdentifiedPubkey: publicKey,
    },
  };

  return httpCallReturnBody(endpoint, httpRequestParams);
}

/**
 * returns an empty array if the identifier does not exists
 * (HTTP 404 Not Found)
 * or if any of the identities for this identifier
 * does not have a public key
 * (in which case it is the backend that will return an empty array)
 */
export async function getIdentityPublicKeys(identifier) {
  assertNotAnyNil(identifier);

  const endpoint = {
    method: 'GET',
    path: '/identities/pubkey',
  };
  const httpRequestParams = {
    queryParams: {
      identifierValue: identifier,
    },
  };

  try {
    return await httpCallReturnBody(endpoint, httpRequestParams);
  } catch (error) {
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getCryptoaction({ accountId, cryptoactionId }) {
  assertNotAnyNil({ accountId, cryptoactionId });

  const endpoint = {
    method: 'GET',
    path: '/accounts/:accountId/crypto/actions/:actionId',
  };
  const httpRequestParams = {
    params: { accountId, actionId: cryptoactionId },
  };

  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  return objectToCamelCase(responseBody);
}

export async function deleteCryptoaction({ accountId, cryptoactionId }) {
  const endpoint = {
    method: 'DELETE',
    path: '/accounts/:accountId/crypto/actions/:actionId',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    params: { accountId, actionId: cryptoactionId },
  };

  return httpCallReturnBody(endpoint, httpRequestParams);
}

export async function setBoxKeyShare({ boxId, boxKeyShare }) {
  const endpoint = {
    method: 'POST',
    path: '/boxes/:boxId/events',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    params: { boxId },
    payload: objectToSnakeCaseDeep({
      type: 'state.key_share',
      extra: boxKeyShare,
    }),
  };

  return httpCallReturnBody(endpoint, httpRequestParams);
}

export async function listCryptoActions({ accountId }) {
  const endpoint = {
    method: 'GET',
    path: '/accounts/:id/crypto/actions',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    params: { id: accountId },
  };

  const responseBody = await httpCallReturnBody(endpoint, httpRequestParams);
  return objectToCamelCase(responseBody);
}

export async function getEncryptedBoxKeyShare(boxId) {
  const endpoint = {
    method: 'GET',
    path: '/box-key-shares/encrypted-invitation-key-share',
    withCsrfToken: true,
  };
  const httpRequestParams = {
    queryParams: {
      boxId,
    },
  };

  return httpCallReturnBody(endpoint, httpRequestParams);
}
