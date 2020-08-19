import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import ReactPiwik from 'react-piwik';

export default (props) => {
  let history = createBrowserHistory(props);
  if (window.env.MATOMO.ENABLED) {
    const piwik = new ReactPiwik({
      url: window.env.MATOMO.URL,
      siteId: window.env.MATOMO.SITEID,
      trackErrors: true,
    });
    history = piwik.connectToHistory(history);
    ReactPiwik.push(['enableHeartBeatTimer']);
    // track the initial pageview
    ReactPiwik.push(['trackPageView']);
  }

  return <Router history={history} {...props} />;
};
