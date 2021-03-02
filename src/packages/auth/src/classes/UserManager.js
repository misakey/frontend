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


import moment from 'moment';
import getUserInfoBuilder from '@misakey/auth/builder/userinfo';
import alwaysNull from '@misakey/helpers/always/null';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isString from '@misakey/helpers/isString';
import log from '@misakey/helpers/log';
import isFunction from '@misakey/helpers/isFunction';
import isEqual from '@misakey/helpers/isEqual';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import SigninResponseError from '@misakey/auth/classes/SigninResponseError';
import OidcClient from './OidcClient';
import IFrameWindow, { TimeoutErrorMessage } from './IFrameWindow';

// BROADCAST_MESSAGE_TYPES
const BC_REQUIRE_SILENT_LOCK = 'MisOidc:channel.bc_required_silent_lock';
const BC_FREE_SILENT_LOCK = 'MisOidc:channel.bc_free_silent_lock';
const BC_LOGOUT = 'MisOidc:channel.bc_logout';
const BC_SIGNIN = 'MisOidc:channel.bc_signin';

export default class UserManager extends OidcClient {
  #userValue

  constructor(
    { automaticSilentRenew = true, ...settings } = {},
    { onUserChange, onTokenExpirationChange } = {},
  ) {
    const options = isFunction(onTokenExpirationChange)
      ? { onTokenExpirationChangeCbs: [onTokenExpirationChange] }
      : undefined;
    super(settings, options);

    this.#userValue = null;
    this.automaticSilentRenew = automaticSilentRenew;
    // Token can be renewed between 10 minutes and 1 minute before it expires
    this.automaticSilentRenewIntervalDelay = [10 * 60, 1 * 60];
    this.silentRequestTimeout = 10000;

    this.expiringTimer = null;

    this.onUserChange = onUserChange;

    // Used to synchronize user and tokenInfo values between instances
    // on the same domaine (several tabs or window opened on the app)
    this.channel = 'BroadcastChannel' in window ? new BroadcastChannel('MisOidc:broadcast_channel') : {};
    this.channel.onmessage = this.onReceiveChannelMessage.bind(this);

    this.addOnTokenExpirationChangeCb(this.loadSilentAuthTimer.bind(this));
  }

  get user() {
    return this.#userValue;
  }

  set user(value) {
    if (!isEqual(this.#userValue, value)) {
      this.#userValue = value;
      if (!isNil(value) && isFunction(this.onUserChange)) {
        this.onUserChange(this.mapUserInfo());
      }
    }
  }

  mapUserInfo(expired = false) {
    const { mid: identityId, aid, acr: userAcr, sco: scope, ...rest } = this.user;
    const accountId = isString(aid) && isEmpty(aid) ? null : aid;
    const acr = isEmpty(userAcr) ? null : parseInt(userAcr, 10);
    const hasAccount = !isNil(accountId);

    return { expired, identityId, accountId, hasAccount, scope, acr, ...rest };
  }

  async getUser() {
    const { expiresAt } = this.tokenInfo;

    if (isNil(expiresAt)) { return Promise.resolve(null); }

    const expired = moment().isAfter(expiresAt);

    if (expired) { return Promise.resolve({ expired }); }

    if (!isNil(this.user)) {
      return this.mapUserInfo(expired);
    }

    return getUserInfoBuilder()
      .then((user) => {
        // don't use the setter to prevent to trigger onUserChange for nothing
        this.#userValue = user;
        return this.mapUserInfo();
      })
      .catch(alwaysNull);
  }

  removeUser(preventBroadcast = false) {
    this.user = null;
    this.clearTokenInfo();
    if (!isNil(this.expiringTimer)) {
      clearTimeout(this.expiringTimer);
    }

    if (!preventBroadcast) {
      this.onPostChannelMessage(BC_LOGOUT);
    }
  }

  async signinRedirect(args = {}) {
    return this.createSigninRequest(args)
      .then((url) => { window.location = url; })
      .catch((err) => {
        logSentryException(err, 'UserManager.signInRedirect', { auth: true });
        return Promise.reject(err);
      });
  }

  signinCallback(url, silent = false) {
    if (silent) {
      return IFrameWindow.notifyParent(url);
    }
    return this.signinEnd(url || window.location.href);
  }

  async signinSilent({
    redirectUrl = this.silentRedirectUrl || this.defaultRedirectUrl,
    prompt = 'none',
    silentRequestTimeout = this.silentRequestTimeout,
    currentSub = isNil(this.user) ? undefined : this.user.sub,
    ...rest
  } = {}) {
    let errorLogged = false;
    return this.createSigninRequest({ redirectUrl, prompt, ...rest })
      .then(async (url) => {
        const iFrameWindow = new IFrameWindow();
        return iFrameWindow
          .navigate({ url, silentRequestTimeout })
          .then(
            ({ url: signinEndUrl }) => this.signinEnd(signinEndUrl, { currentSub, silent: true })
              .catch((err) => {
                errorLogged = true;
                // logSentryException already done in signinEnd
                return Promise.reject(err);
              }),
          )
          .catch((err) => {
            if (!errorLogged) {
              // timeout occurs if user lose connection
              const level = err.message === TimeoutErrorMessage ? 'warning' : 'error';
              logSentryException(err, 'UserManager.signinSilent --> iFrameWindow.navigate', { auth: true }, level);
              errorLogged = true;
            }
            return Promise.reject(err);
          });
      })
      .catch((err) => {
        if (!errorLogged) {
          logSentryException(err, 'UserManager.signinSilent --> createSigninRequest', { auth: true });
          errorLogged = true;
        }
        return Promise.reject(err);
      });
  }

  async signinEnd(url, { currentSub, silent } = {}) {
    return this.processSigninResponse(url)
      .then(({ user, referrer }) => {
        const { profile, expiresAt } = user;

        if (!isNil(currentSub)) {
          const { sub } = profile;
          if (currentSub !== sub) {
            throw new Error('login_required');
          }
        }

        this.user = profile;
        this.onPostChannelMessage(BC_SIGNIN, { ...this.user, expiresAt });
        return {
          user: this.mapUserInfo(),
          expiresAt,
          referrer,
        };
      })
      .catch((err) => {
        // referrer can contain sensible information as boxes key share
        // we don't want it to be sent to Sentry
        const sentryErr = (err instanceof SigninResponseError) ? new Error(err.error) : err;
        // 'login_required' = functional error, hydra cookie is expired or sub has changed
        const level = silent && err.message === 'login_required' ? 'warning' : 'error';

        logSentryException(sentryErr, 'UserManager.signInEnd', { auth: true, silent }, level);
        return Promise.reject(err);
      });
  }

  // silent processing callback for setTimout
  silentRenewal() {
    // resource is not available to signInSilently
    if (this.silentLocked) { return; }

    // Take the resource to prevent other instances to signin in parallele
    this.silentLocked = true;
    this.onPostChannelMessage(BC_REQUIRE_SILENT_LOCK);

    log('Start silent renew ...');
    this.signinSilent()
      .then(() => { log('silent renew successfull'); })
      .catch(() => { this.removeUser(); })
      // Free the resource
      .finally(() => {
        this.silentLocked = false;
        this.onPostChannelMessage(BC_FREE_SILENT_LOCK);
      });
  }

  loadSilentAuthTimer() {
    if (!this.automaticSilentRenew) {
      return;
    }

    if (isNil(this.tokenInfo.expiresAt)) {
      return;
    }

    if (!isNil(this.expiringTimer)) {
      // clear previous timer if it exists
      clearTimeout(this.expiringTimer);
    }

    const duration = moment(this.tokenInfo.expiresAt).diff(moment());

    if (duration > 0) {
      // compute a random time to renew token between silentRenew interval delay
      // to avoid to collide with others tabs that could renew token on their side
      const [max, min] = this.automaticSilentRenewIntervalDelay;
      const randomSafeDelay = Math.random() * (max - min) + min;
      const renewTimeout = duration - (randomSafeDelay * 1000);
      const delay = renewTimeout > 0 ? renewTimeout : 0;
      this.expiringTimer = setTimeout(
        this.silentRenewal.bind(this),
        delay,
      );
      log(`SigninSilent will be launched in ${delay} ms`);
    }
  }

  onPostChannelMessage(type, details) {
    if (isFunction(this.channel.postMessage)) {
      this.channel.postMessage({ type, details });
    }
  }

  onReceiveChannelMessage({ data = {} }) {
    const { type, details } = data;
    if (type === BC_REQUIRE_SILENT_LOCK) {
      this.silentLocked = true;
      return;
    }
    if (type === BC_FREE_SILENT_LOCK) {
      this.silentLocked = false;
      return;
    }
    if (type === BC_LOGOUT) {
      this.removeUser(/* preventBroadcast */ true);
      return;
    }
    if (type === BC_SIGNIN) {
      const { expiresAt, ...rest } = details;
      this.tokenInfo = { expiresAt };
      this.user = rest;
    }
  }
}
