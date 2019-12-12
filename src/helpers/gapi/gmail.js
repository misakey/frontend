import { Base64 } from 'js-base64';

import { GMAIL } from 'constants/mail-providers';

import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';
import { onGApiLoad, askAuth } from './index';

// CONSTANTS
const GMAIL_PATH = ['gapi', 'client', 'gmail'];

// HELPERS
const gmailPath = path(GMAIL_PATH);

const requestMessage = (raw, callback) => {
  const request = window.gapi.client.gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw,
    },
  });
  request.execute(callback);
};

export const onLoadSendMail = onGApiLoad('client:auth2', ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'], 'https://www.googleapis.com/auth/gmail.send');

export const onAlreadyLoadedSendMail = askAuth('client:auth2', ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'], 'https://www.googleapis.com/auth/gmail.send');

export const SEND_MAIL_CONFIG = {
  ...GMAIL,
  onLoad: onLoadSendMail,
  onAlreadyLoaded: onAlreadyLoadedSendMail,
};

export const sendMessage = (mailto, subject, body, callback) => {
  const email = `to: ${mailto}
Subject: =?utf-8?B?${Base64.encodeURI(subject)}?=
Content-Type: text/html; charset=UTF-8

${body.replace(/\n/g, '<br/>')}`;
  const base64EncodedEmail = Base64.encodeURI(email);
  if (isNil(gmailPath(window))) {
    window.gapi.client.load('gmail', 'v1', () => { requestMessage(base64EncodedEmail, callback); });
  } else {
    requestMessage(base64EncodedEmail, callback);
  }
};
