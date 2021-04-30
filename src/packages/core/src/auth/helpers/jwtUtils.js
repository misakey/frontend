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

import isNil from '@misakey/core/helpers/isNil';
import isArray from '@misakey/core/helpers/isArray';

export const parseJwt = (data) => {
  const [headerStr, payloadStr] = data.split('.');
  const header = JSON.parse(atob(headerStr));
  const payload = JSON.parse(atob(payloadStr));
  return { header, payload };
};

export const validateJwtAttributes = (
  jwt,
  issuer,
  audience,
  // https://github.com/IdentityModel/oidc-client-js/issues/24
  clockSkew = 300,
  now = parseInt((Date.now() / 1000), 10),
  timeInsensitive,
) => {
  const { payload } = parseJwt(jwt);
  const { iss, aud, iat, nbf, exp } = payload;

  if (iss !== issuer) {
    return Promise.reject(new Error(`Invalid issuer in token: ${iss}`));
  }

  if (isNil(aud)) {
    return Promise.reject(new Error('aud was not provided'));
  }
  const validAudience = aud === audience || (isArray(aud) && aud.includes(audience));

  if (!validAudience) {
    return Promise.reject(new Error(`Invalid audience in token: ${aud}`));
  }

  if (!timeInsensitive) {
    const lowerNow = now + clockSkew;
    const upperNow = now - clockSkew;

    if (isNil(iat)) {
      return Promise.reject(new Error('iat was not provided'));
    }

    if (lowerNow < iat) {
      return Promise.reject(new Error(`iat is in the future: ${iat} - ${now}`));
    }

    if (nbf && lowerNow < nbf) {
      return Promise.reject(new Error(`nbf is in the future: ${nbf} - ${now}`));
    }

    if (isNil(exp)) {
      return Promise.reject(new Error('exp was not provided'));
    }

    if (exp < upperNow) {
      return Promise.reject(new Error(`exp is in the past:${exp} - ${now}`));
    }
  }

  return Promise.resolve(payload);
};

export const validateJwt = async (
  jwt,
  issuer,
  audience,
  clockSkew,
  now,
  timeInsensitive,
) => {
  try {
    return await validateJwtAttributes(
      jwt, issuer, audience, clockSkew, now, timeInsensitive,
    );
  } catch (err) {
    return Promise.reject(err);
  }
};
