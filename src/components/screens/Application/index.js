import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import { Route, Switch, Redirect, generatePath } from 'react-router-dom';

import routes from 'routes';

import ApplicationSchema from 'store/schemas/Application';

import Screen from 'components/dumb/Screen';
import AppBar from 'components/dumb/AppBar';
import ApplicationList from 'components/dumb/Application/List';
import SplashScreen from 'components/dumb/SplashScreen';
import DefaultScreen from 'components/screens/Plugin/DefaultScreen';

import 'components/screens/Application/Application.scss';

import { sendMessage } from 'background';
import { GET_CURRENT_DOMAIN } from 'background/messages';
import ApplicationNone from './None';
import ApplicationInfo from './Info';
import ApplicationSearchBar from './SearchBar';

// HELPERS
const getLinkTo = (searchIsFocused, isAuthenticated, hasBoxes) => {
  if (!searchIsFocused && isAuthenticated && hasBoxes) {
    return routes.application.personalData;
  }

  return routes.application.info;
};

// HOOKS
const useLinkTo = (searchIsFocused, isAuthenticated, hasBoxes) => useMemo(
  () => getLinkTo(searchIsFocused, isAuthenticated, hasBoxes),
  [searchIsFocused, isAuthenticated, hasBoxes],
);

// COMPONENTS

function Application({
  className, entities, hasBoxes,
  isAuthenticated, location, match, updatedAt,
}) {
  const [searchIsFocused, setSearchFocus] = React.useState(false);
  const [isFetching, setFetching] = React.useState(false);
  const [pluginDomain, setPluginDomain] = React.useState(false);

  const linkTo = useLinkTo(searchIsFocused, isAuthenticated, hasBoxes);

  const getPluginDomain = useCallback(
    () => {
      if (window.env.PLUGIN) {
        sendMessage(GET_CURRENT_DOMAIN)
          .then((mainDomain) => { setPluginDomain(mainDomain); });
      }
    },
    [],
  );

  useEffect(getPluginDomain, []);

  return (
    <div className={clsx('Application', className)}>
      {pluginDomain && (
        <Redirect to={generatePath(routes.application.thirdParty, { mainDomain: pluginDomain })} />
      )}
      <Screen>
        {!window.env.PLUGIN && (
          <section className={clsx('main', { slided: searchIsFocused })}>
            <AppBar />
            <ApplicationSearchBar
              onFetching={(value) => setFetching(value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
            <nav className={clsx({ 'prevent-scroll': isFetching })}>
              {updatedAt !== null && (
                <ApplicationList
                  applications={entities}
                  linkTo={linkTo}
                  search={location.search}
                />
              )}
              {isFetching && <SplashScreen />}
            </nav>
          </section>
        )}

        <Switch>
          <Route path={routes.plugin} component={DefaultScreen} />
          <Route path={routes.application.info} component={ApplicationInfo} />
          <Route exact path={match.path} component={ApplicationNone} />
        </Switch>
      </Screen>
    </div>
  );
}

Application.propTypes = {
  className: PropTypes.string,
  entities: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  hasBoxes: PropTypes.bool,
  isAuthenticated: PropTypes.bool,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  updatedAt: PropTypes.string,
};

Application.defaultProps = {
  className: '',
  entities: [],
  hasBoxes: false,
  isAuthenticated: false,
  updatedAt: null,
};

export default connect(
  (state) => ({
    ...state.screens.applications,
    hasBoxes: state.screens.applications.boxes.length > 0,
    entities: denormalize(
      state.screens.applications.ids,
      ApplicationSchema.collection,
      state.entities,
    ),
    isAuthenticated: !!state.auth.token,
  }),
)(Application);
