// Implementation freely inspired from
// https://github.com/IdentityModel/oidc-client-js

// Copyright (c) Brock Allen & Dominick Baier.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { handleResponse } from '@misakey/core/api/Endpoint/send';
import isString from '@misakey/core/helpers/isString';
import isNil from '@misakey/core/helpers/isNil';
import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import pick from '@misakey/core/helpers/pick';
import { uuid4RFC4122 } from '@misakey/core/helpers/uuid4';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import validateProperties from '@misakey/core/helpers/validateProperties';
import isEmpty from '@misakey/core/helpers/isEmpty';
import { parseJwt, validateJwt } from '@misakey/core/auth/helpers/jwtUtils';
import SigninResponseError from '@misakey/core/auth/classes/SigninResponseError';
import log from '@misakey/core/helpers/log';
import isArray from '@misakey/core/helpers/isArray';
import snakeCase from '@misakey/core/helpers/snakeCase';
import trimStart from '@misakey/core/helpers/trimStart';
import isJSON from '@misakey/core/helpers/isJSON';

const TOKEN_INFO_STORE_KEY = 'misoidc:tokenInfo';
const STATE_STORE_PREFIX = 'misoidc:state';

const mergeLoginHint = (loginHint, object) => {
  const current = isString(loginHint) && isJSON(loginHint) ? JSON.parse(loginHint) : {};
  return JSON.stringify({ ...current, ...object });
};

export default class OidcClient {
  #tokenInfoValue

  constructor(
    { authority, clientId, clockSkew, redirectUri, scope = 'openid tos privacy_policy' } = {},
    { onTokenExpirationChangeCbs = [] } = {},
  ) {
    this.authority = authority;
    this.clientId = clientId;
    this.clockSkew = clockSkew;
    this.signingKeys = null;
    this.defaultRedirectUri = redirectUri;
    this.defaultScope = scope;
    this.issuer = `${authority}/`;
    this.endpoints = {
      jwksUri: `${authority}/.well-known/jwks.json`,
      authorization: `${authority}/oauth2/auth`,
    };

    this.stateStorage = sessionStorage;
    this.tokenInfoStorage = localStorage;

    // expiresAt value (expiration date of the access token) is stored
    // in localStorage to know if a session were existing on the app before
    // and know if app should re-signIn (expired) or launch a silent auth timer
    this.#tokenInfoValue = null;

    this.onTokenExpirationChangeCbs = onTokenExpirationChangeCbs;
  }

  async createSigninRequest({
    endpointUrl = this.endpoints.authorization,
    clientId = this.clientId,
    redirectUri = this.defaultRedirectUri,
    responseType = 'code',
    scope = this.defaultScope,
    authority = this.authority,
    extraQueryParams = {},
    acrValues,
    referrer = `${window.location.pathname}${window.location.search || ''}${window.location.hash || ''}`,
    loginHint,
    ...rest
  }) {
    const err = validateProperties(
      { endpointUrl, clientId, redirectUri, responseType, scope, authority },
    );
    if (err) { return Promise.reject(err); }

    const stateId = uuid4RFC4122();
    const nonce = uuid4RFC4122();

    // store information about the flow in the sessionStorage
    // to do some verification at the end of the flow
    const signinState = {
      id: stateId,
      nonce,
      clientId,
      authority,
      referrer,
      acrValues,
    };

    const query = new URLSearchParams(
      objectToSnakeCase({ clientId, redirectUri, responseType, scope, state: stateId, nonce }),
    );

    if (!isNil(acrValues)) {
      query.set('acr_values', acrValues);
    }

    query.set('login_hint', mergeLoginHint(loginHint, { state: stateId }));

    const optional = pick(
      ['prompt', 'display', 'maxAge', 'uiLocales', 'idTokenHint',
        'resource', 'request', 'requestUri', 'responseMode'],
      rest,
    );

    Object.entries(optional).forEach(([key, value]) => {
      if (!isNil(value)) {
        query.set(snakeCase(key), value);
      }
    });

    Object.entries(extraQueryParams).forEach(([key, value]) => {
      if (!isNil(value)) {
        query.set(key, value);
      }
    });

    const url = `${endpointUrl}?${query.toString()}`;

    await this.storeState(signinState.id, signinState);
    return url;
  }

  storeState(id, values) {
    return Promise.resolve(this.stateStorage.setItem(`${STATE_STORE_PREFIX}.${id}`, JSON.stringify(values)));
  }

  removeState(id) {
    return this.stateStorage.removeItem(`${STATE_STORE_PREFIX}.${id}`);
  }

  getStateInStore(id) {
    const state = this.stateStorage.getItem(`${STATE_STORE_PREFIX}.${id}`);
    if (isNil(state)) {
      return null;
    }
    return JSON.parse(state);
  }

  get tokenInfo() {
    if (isNil(this.#tokenInfoValue)) {
      this.loadTokenInfo();
    }
    return this.#tokenInfoValue;
  }

  set tokenInfo({ expiresAt, ...rest }) {
    const hasChanged = isNil(this.#tokenInfoValue)
      || (this.#tokenInfoValue.expiresAt !== expiresAt);
    this.#tokenInfoValue = { expiresAt, ...rest };
    this.tokenInfoStorage.setItem(TOKEN_INFO_STORE_KEY, JSON.stringify(this.tokenInfo));

    if (hasChanged) {
      if (!isArray(this.onTokenExpirationChangeCbs)) {
        log('onTokenExpirationChangeCbs should be an array !', 'error'); return;
      }
      this.onTokenExpirationChangeCbs.forEach((callback) => {
        callback(expiresAt);
      });
    }
  }

  addOnTokenExpirationChangeCb(callback) {
    this.onTokenExpirationChangeCbs.push(callback);
  }

  loadTokenInfo() {
    const info = this.tokenInfoStorage.getItem(TOKEN_INFO_STORE_KEY);
    this.tokenInfo = isNil(info) ? { expiresAt: null } : JSON.parse(info);
  }

  clearTokenInfo() {
    this.tokenInfo = {};
    return this.tokenInfoStorage.removeItem(TOKEN_INFO_STORE_KEY);
  }

  async getSigningKeys() {
    if (!isNil(this.signingKeys)) {
      return Promise.resolve(this.signingKeys);
    }

    return fetch(this.endpoints.jwksUri)
      .then(handleResponse)
      .then(({ keys }) => {
        if (isNil(keys)) {
          throw new Error('Missing keys on keyset');
        }

        this.signingKeys = keys;
        return this.signingKeys;
      });
  }

  async validateIdToken(state, response) {
    const { nonce: stateNonce, clientId, acrValues: askedAcr } = state;
    const { idToken, expiresAt } = response;

    const jwt = parseJwt(idToken);

    const err = validateProperties({ stateNonce, jwt });
    if (err) { return Promise.reject(err); }

    const { header, payload } = jwt;

    const jwtError = validateProperties({ header, payload });
    if (jwtError) { return Promise.reject(err); }

    const { nonce: jwtNonce, sub, acr: payloadAcr } = payload;

    const subErr = validateProperties({ sub });
    if (subErr) { return Promise.reject(err); }

    const acr = isEmpty(payloadAcr) ? null : parseInt(payloadAcr, 10);
    payload.acr = acr;

    if (!isNil(askedAcr) && acr !== askedAcr) {
      return Promise.reject(new Error('acr does not match with asked acr'));
    }

    if (stateNonce !== jwtNonce) {
      return Promise.reject(new Error('Invalid nonce in id_token'));
    }

    const { kid } = header;

    return this.getSigningKeys().then((keys) => {
      if (isNil(keys)) {
        return Promise.reject(new Error('No signing keys from metadata'));
      }

      const [key] = keys.filter(({ kid: keyKid }) => keyKid === kid);

      if (isNil(key)) {
        return Promise.reject(new Error('No key matching kid or alg found in signing keys'));
      }

      return validateJwt(idToken, key, this.issuer, clientId, this.clockSkew).then(() => {
        response.profile = payload;
        this.tokenInfo = { expiresAt };
        return response;
      });
    });
  }


  validateSigninResponse(state, response) {
    const { id: stateId, clientId, authority } = state;
    const { stateId: responseStateId, idToken } = response;

    if (stateId !== responseStateId) {
      return Promise.reject(new Error('State does not match'));
    }

    const err = validateProperties({ clientId, authority, idToken });
    if (err) { return Promise.reject(err); }

    return this.validateIdToken(state, response);
  }

  async processSigninResponse(url) {
    const { hash, search } = new URL(url);
    const hashParams = trimStart(hash, '#').split('&').reduce((params, item) => {
      const [key, value] = item.split('=');
      return { ...params, [key]: value };
    }, {});

    const searchParams = trimStart(search, '?').split('&').reduce((params, item) => {
      const [key, value] = item.split('=');
      return { ...params, [key]: value };
    }, {});

    const {
      state: stateId, idToken, sessionState, tokenType, scope, profile, expiresIn, expiry,
    } = objectToCamelCase(hashParams);

    const { error, errorDescription, errorUri } = objectToCamelCase(searchParams);

    if (!isNil(error)) {
      this.clearTokenInfo();
      return Promise.reject(new Error(`${error}: ${errorDescription}`));
    }

    if (!isNil(errorUri)) {
      this.clearTokenInfo();
      return Promise.reject(new Error(errorUri));
    }

    const params = {
      error,
      errorDescription,
      errorUri,
      idToken,
      sessionState,
      tokenType,
      scope,
      profile,
      expiresIn,
      expiresAt: expiry,
      stateId,
    };

    if (isNil(stateId)) {
      return Promise.reject(new Error('No state in response'));
    }

    const state = this.getStateInStore(stateId);

    if (isNil(state)) {
      throw new Error('Could not finalize auth flow: missing state in storage');
    }

    const { referrer } = state;

    try {
      const user = await this.validateSigninResponse(state, params);
      this.removeState(stateId);
      return { user, referrer };
    } catch (err) {
      this.clearTokenInfo();
      this.removeState(stateId);
      return Promise.reject(new SigninResponseError(err, referrer));
    }
  }
}
