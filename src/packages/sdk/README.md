# The Misakey SDK

A NodeJS package that lets you send text messages and files to users through Misakey.

```javascript
const fs = require('fs');
const Misakey = require('@misakey/sdk');

const misakey = new Misakey(YOUR_ORG_ID, YOUR_ORG_AUTH_SECRET);
misakey.pushMessages({
  messages: [
    `Hello ${DATA_SUBJECT}, here is your data :-)`,
    {
      filename: PATH_TO_FILE.split('/').pop(-1),
      data: fs.readFileSync(PATH_TO_FILE),
    },
  ],
  boxTitle: `Your ${DATATAG} data`,
  dataSubject: DATA_SUBJECT,
  dataTag: DATATAG,
}).then((boxInfo) => console.log(boxInfo));
```

Output:

```
{
  boxId: 'd8dcbd74-a50e-42fb-a25d-1618f07da4f4',
  datatagId: '35aec043-bb95-4c93-8d1b-e311021baba1',
  invitationLink: 'https://app.misakey.com/boxes/d8dcbd74-a50e-42fb-a25d-1618f07da4f4#h_iSvbUr_3wnNQ6SK6-p6hS2U9xXbuzFYewxJz2jIwY'
}
```

If you want to point to a different base domain that `misakey.com`
(typically, to point to a test/demo domain)
you can do so by setting environment variable `MISAKEY_SDK_BASE_TARGET_DOMAIN`.


See also example file `example.js`.
Note that it *requires* `MISAKEY_SDK_BASE_TARGET_DOMAIN` to be set,
so that you don't unintentionally call `misakey.com` while tinkering with the SDK.
It also requires you to create a file `example-variables.js`
that exports the variables it needs:

```javascript
// file: example-variables.js
module.exports = {
  ORG_ID: 'dec34530-1e71-4831-9f6f-b3cba469e241',
  ORG_AUTH_SECRET: 'xJE1AQM+xYoZhm+PiULrTBva//IwT1uu6fYrlOm3E4U=',
  TEXT_MESSAGES: 'Here is your pay stub',
  PATH_TO_FILE: '/var/data/pay-stub-of-michel-at-misakey-dot-com.pdf',
  DATA_SUBJECT: 'michel@misakey.com',
  DATATAG: 'salary',
  BOX_TITLE: 'Pay Stub of michel@misakey.com',
};
```

```
$ MISAKEY_SDK_BASE_TARGET_DOMAIN=misakey.com.local node example.js
{
  boxId: '89defdad-d913-4bfa-8648-41328748188f',
  datatagId: '35aec043-bb95-4c93-8d1b-e311021baba1',
  invitationLink: 'https://app.misakey.com.local/boxes/89defdad-d913-4bfa-8648-41328748188f#j_NzjPZd6iDGE5uXzGlvuMS1EeSkMHYuOMRtFXSFZHU'
}
```