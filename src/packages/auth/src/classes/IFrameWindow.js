/* eslint-disable no-underscore-dangle */
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


import log from '@misakey/helpers/log';

const DefaultTimeout = 10000;

export default class IFrameWindow {
  constructor() {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });

    this._boundMessageEvent = this._message.bind(this);
    window.addEventListener('message', this._boundMessageEvent, false);

    this._frame = window.document.createElement('iframe');

    // shotgun approach
    this._frame.style.visibility = 'hidden';
    this._frame.style.position = 'absolute';
    this._frame.style.display = 'none';
    this._frame.style.width = 0;
    this._frame.style.height = 0;

    window.document.body.appendChild(this._frame);
  }

  navigate(params) {
    if (!params || !params.url) {
      this._error('No url provided');
    } else {
      const timeout = params.silentRequestTimeout || DefaultTimeout;
      log(`IFrameWindow.navigate: Using timeout of:' ${timeout}`);
      this._timer = window.setTimeout(this._timeout.bind(this), timeout);
      this._frame.src = params.url;
    }

    return this.promise;
  }

  get promise() {
    return this._promise;
  }

  _success(data) {
    this._cleanup();

    log('IFrameWindow: Successful response from frame window');
    this._resolve(data);
  }

  _error(message) {
    this._cleanup();

    log(message, 'error');
    this._reject(new Error(message));
  }

  close() {
    this._cleanup();
  }

  _cleanup() {
    if (this._frame) {
      log('IFrameWindow: cleanup');

      window.removeEventListener('message', this._boundMessageEvent, false);
      window.clearTimeout(this._timer);
      window.document.body.removeChild(this._frame);

      this._timer = null;
      this._frame = null;
      this._boundMessageEvent = null;
    }
  }

  _timeout() {
    log('IFrameWindow.timeout');
    this._error('Frame window timed out');
  }

  _message(e) {
    log('IFrameWindow.message');

    if (this._timer
            && e.origin === this._origin
            && e.source === this._frame.contentWindow
    ) {
      const url = e.data;
      if (url) {
        this._success({ url });
      } else {
        this._error('Invalid response from frame');
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get _origin() {
    return `${window.location.protocol}//${window.location.host}`;
  }

  static notifyParent(url = window.location.href) {
    log('IFrameWindow.notifyParent');
    if (window.frameElement) {
      if (url) {
        log('IFrameWindow.notifyParent: posting url message to parent');
        window.parent.postMessage(url, `${window.location.protocol}//${window.location.host}`);
      }
    }
  }
}
