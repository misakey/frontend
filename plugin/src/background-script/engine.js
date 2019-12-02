import { WebExtensionBlocker, fromWebRequestDetails } from '@cliqz/adblocker-webextension';
import { parse } from 'tldts';
import globals from './globals';

const DEFAULT_PURPOSE = 'other';

// @FIXME add to js-common helpers
function getMainDomainWithoutPrefix(domain) {
  if (domain.startsWith('www.')) {
    return domain.replace('www.', '');
  }
  return domain;
}

function getRequestDetails({ tabId, originUrl, initiator, url }) {
  const initiatorUrl = globals.tabsInitiator.get(tabId) || originUrl || initiator;
  const { hostname: targetDomain } = parse(url);
  const { hostname: initiatorDomain } = parse(initiatorUrl);
  return { initiator: getMainDomainWithoutPrefix(initiatorDomain), target: targetDomain };
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
  const mainPurpose = globals.rules[ruleId] || DEFAULT_PURPOSE;

  if (globals.pausedBlocking || globals.isRequestWhitelisted(initiator, target, mainPurpose)) {
    return { blockingResponse: {}, mainPurpose };
  }

  if (redirect !== undefined) {
    return { blockingResponse: { redirectUrl: redirect.dataUrl }, mainPurpose };
  }

  if (match === true) {
    return { blockingResponse: { cancel: true }, mainPurpose };
  }

  return {};
}


export { getBlockingResponse, deserializeEngine };
