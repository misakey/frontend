import { WebExtensionBlocker } from '@cliqz/adblocker-webextension';
import { parse } from 'tldts';
import globals from './globals';

const DEFAULT_PURPOSE = 'other';

function getRequestDetails({ tabId, originUrl, initiator, url }) {
  const initiatorUrl = globals.tabsInitiator.get(tabId) || originUrl || initiator;
  const { hostname: targetDomain } = parse(url);
  const { hostname: initiatorDomain } = parse(initiatorUrl);
  return { initiator: initiatorDomain, target: targetDomain };
}

function isRequestFirstParty(initiatorDomain, targetDomain) {
  return initiatorDomain === targetDomain;
}

function deserializeEngine(engine) {
  return WebExtensionBlocker.deserialize(new Uint8Array(engine));
}

function getBlockingResponse(engine, request, details) {
  const { redirect, match, filter } = engine.match(request);

  // The request didn't match, no need to process the rest of the treatment
  if (redirect === undefined && match === false) {
    return { blockingResponse: {}, mainPurpose: null };
  }

  const { initiator, target } = getRequestDetails(details);

  // @TODO: delete details.type === 'main_frame' when we will have associated domains info
  if (isRequestFirstParty(initiator, target) || request.isMainFrame()) {
    return { blockingResponse: {}, mainPurpose: null };
  }

  // Check if request has been whitelisted
  const ruleId = filter.getId();
  const mainPurpose = globals.rules[ruleId] || DEFAULT_PURPOSE;

  if (globals.pausedBlocking || globals.isRequestWhitelisted(target)) {
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
