const fs = require('fs');

const Misakey = require('./src');

/* eslint-disable import/no-unresolved */
/*
 * create a file `example-variables.js`
 * and make it export these variables
 * with the values you want.
 */
const {
  ORG_ID,
  ORG_AUTH_SECRET,
  TEXT_MESSAGE,
  PATH_TO_FILE,
  DATA_SUBJECT,
  DATATAG,
  BOX_TITLE,
} = require('./example-variables');
/* eslint-enable import/no-unresolved */

if (!process.env.MISAKEY_SDK_BASE_TARGET_DOMAIN) {
  throw Error('`env variable MISAKEY_SDK_BASE_TARGET_DOMAIN not set');
}

async function main() {
  const misakey = new Misakey(ORG_ID, ORG_AUTH_SECRET);

  const messages = [
    TEXT_MESSAGE,
    {
      filename: PATH_TO_FILE.split('/').pop(-1),
      data: fs.readFileSync(PATH_TO_FILE),
    },
  ];

  const boxInfo = await misakey.pushMessages({
    messages,
    boxTitle: BOX_TITLE,
    dataSubject: DATA_SUBJECT,
    dataTag: DATATAG,
  });

  return {
    misakey,
    boxInfo,
  };
}

/* eslint-disable no-console */
if (require.main === module) {
  (async () => {
    try {
      const { boxInfo } = await main();
      console.log(boxInfo);
    } catch (error) {
      try {
        const jsonBody = await error.response.json();
        console.error('ERROR:', jsonBody);
      } catch {
        console.error('ERROR:', error);
      }
      console.log(error.stack);
    }
  })();
}
/* eslint-enable no-console */
