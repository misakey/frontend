import React, { useMemo } from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactPiwik from 'react-piwik';

// HELPERS
const createPiwikBrowserHistory = (props) => {
  const history = createBrowserHistory(props);
  if (window.env.MATOMO.ENABLED) {
    const piwik = new ReactPiwik({
      url: window.env.MATOMO.URL,
      siteId: window.env.MATOMO.SITEID,
      trackErrors: true,
    });
    const piwikHistory = piwik.connectToHistory(history);
    ReactPiwik.push(['enableHeartBeatTimer']);
    // track the initial pageview
    ReactPiwik.push(['trackPageView']);
    return piwikHistory;
  }
  return history;
};

// COMPONENTS
export default (props) => {
  const history = useMemo(
    () => createPiwikBrowserHistory(props),
    [props],
  );

  return <Router history={history} {...props} />;
};
