import React, { useMemo, useCallback, useState, useEffect } from 'react';

import isEmpty from '@misakey/core/helpers/isEmpty';
import { createBrowserHistory } from 'history';

import DialogPrompt from '@misakey/ui/Dialog/Prompt';
import { Router } from 'react-router-dom';
import ReactPiwik from 'react-piwik';

// CONSTANTS
const INITIAL_PROMPT = {};

// COMPONENTS
const RouterWithCustomConfirm = (props) => {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);

  const open = useMemo(
    () => !isEmpty(prompt),
    [prompt],
  );

  const piwik = useMemo(
    () => (window.env.MATOMO.ENABLED
      ? new ReactPiwik({
        url: window.env.MATOMO.URL,
        siteId: window.env.MATOMO.SITEID,
        trackErrors: true,
      })
      : null),
    [],
  );

  const getUserConfirmation = useCallback(
    (message, callback) => {
      setPrompt({ message, callback });
    },
    [setPrompt],
  );

  const history = useMemo(
    () => {
      const browserHistory = createBrowserHistory({ ...props, getUserConfirmation });
      return window.env.MATOMO.ENABLED
        ? piwik.connectToHistory(browserHistory)
        : browserHistory;
    },
    [props, piwik, getUserConfirmation],
  );



  const onClose = useCallback(
    () => {
      setPrompt(INITIAL_PROMPT);
    },
    [setPrompt],
  );

  useEffect(
    () => {
      if (window.env.MATOMO.ENABLED) {
        ReactPiwik.push(['enableHeartBeatTimer']);
        // track the initial pageview
        ReactPiwik.push(['trackPageView']);
      }
    },
    [],
  );

  return (
    <>
      <Router
        history={history}
        {...props}
      />
      <DialogPrompt
        open={open}
        onClose={onClose}
        {...prompt}
      />
    </>
  );
};

export default RouterWithCustomConfirm;
