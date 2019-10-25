import { WebExtensionBlocker, fromWebRequestDetails } from '@cliqz/adblocker-webextension';
import propOr from '@misakey/helpers/propOr';
import { parse } from 'tldts';
import globals from './globals';

const DEFAULT_PURPOSE = 'other';
const getMainPurpose = propOr(DEFAULT_PURPOSE, 'mainPurpose');

function getRequestDetails({ tabId, originUrl, initiator, url }) {
  const initiatorUrl = globals.tabsInitiator.get(tabId) || originUrl || initiator;
  const { domain: targetDomain } = parse(url);
  const { domain: initiatorDomain } = parse(initiatorUrl);
  return { initiator: initiatorDomain, target: targetDomain };
}

function isRequestFirstParty(initiatorDomain, targetDomain) {
  return initiatorDomain === targetDomain;
}

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

  const { initiator, target } = getRequestDetails(details);

  // @TODO: delete details.type === 'main_frame' when we will have associated domains info
  if (isRequestFirstParty(initiator, target) || details.type === 'main_frame') {
    return { blockingResponse: {}, rule: null };
  }

  // Check if request has been whitelisted
  const ruleId = filter.getId();
  const rule = globals.rules[ruleId]
    || globals.rules[globals.getRuleIdByFilter(filter)]
    || { ...filter, mainPurpose: DEFAULT_PURPOSE };

  const mainPurpose = getMainPurpose(rule);

  if (globals.pausedBlocking || globals.isRequestWhitelisted(initiator, target, mainPurpose)) {
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
