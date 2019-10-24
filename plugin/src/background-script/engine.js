import { WebExtensionBlocker, fromWebRequestDetails } from '@cliqz/adblocker-webextension';
import globals from './globals';

const DEFAULT_CATEGORY = 'other';

function deserializeEngine(engine) {
  return WebExtensionBlocker.deserialize(new Uint8Array(engine));
}

function getBlockingResponse(engine, details) {
  const request = fromWebRequestDetails(details);
  const { redirect, match, filter } = engine.match(request);

  // The request didn't match, no need to process the rest of the treatment
  if (redirect === undefined && match === false) {
    return { blockingResponse: {}, rule: null };
  }

  // Check if request has been whitelisted
  const ruleId = filter.getId();
  const rule = globals.rules[ruleId]
    || globals.rules[globals.getRuleIdByFilter(filter)]
    || { ...filter, mainPurpose: DEFAULT_CATEGORY };

  if (globals.pausedBlocking || globals.requestIsWhitelisted(details, rule)) {
    return { blockingResponse: {}, rule };
  }

  if (redirect !== undefined) {
    return { blockingResponse: { redirectUrl: redirect.dataUrl }, rule };
  }

  if (match === true) {
    return { blockingResponse: { cancel: true }, rule };
  }

  return {};
}


export { getBlockingResponse, deserializeEngine };
