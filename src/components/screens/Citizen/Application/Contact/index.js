import React, { lazy, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';


import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import getNextSearch from '@misakey/helpers/getNextSearch';
import withDataboxURL from 'components/smart/withDataboxURL';

import DefaultSplashScreen from '@misakey/ui/Screen/Splash';

import Screen, { SCREEN_STATE_PROPTYPES } from 'components/dumb/Screen';

// LAZY
const ContactPreview = lazy(() => import('components/screens/Citizen/Application/Contact/Preview'));
const ContactProviders = lazy(() => import('components/screens/Citizen/Application/Contact/Providers'));

// COMPONENTS
const Contact = ({
  entity,
  databoxURL,
  databox,
  isNewDatabox,
  isFetchingDatabox,
  screenProps,
  location,
}) => {
  const screenPropsWithDataboxURL = useMemo(
    () => ({
      ...screenProps,
      state: {
        ...screenProps.state,
        isFetching: screenProps.state.isFetching || isFetchingDatabox,
      },
    }),
    [screenProps, isFetchingDatabox],
  );

  const isLoading = useMemo(
    () => {
      const searchParams = new URLSearchParams(location.search);
      // if we have searchParams recontact defined we don't need to check isNewDatabox
      // and we can have isNewDatabox to null
      return isNil(searchParams.get('recontact')) && isNil(isNewDatabox);
    },
    [isNewDatabox, location],
  );

  const rootRouteTo = useMemo(
    () => {
      if (isLoading) {
        return null;
      }
      const newLocation = { ...location, pathname: routes.citizen.application.contact.preview };
      const searchParams = new URLSearchParams(location.search);

      if (isNil(searchParams.get('recontact'))) {
        return {
          ...newLocation,
          search: getNextSearch(location.search, new Map([
            ['recontact', !isNewDatabox],
          ])),
        };
      }
      return newLocation;
    },
    [isNewDatabox, location, isLoading],
  );

  return (
    <Screen {...screenPropsWithDataboxURL}>
      <Switch>
        {!isLoading ? (
          <Redirect
            exact
            from={routes.citizen.application.contact._}
            to={rootRouteTo}
          />
        ) : <DefaultSplashScreen />}
        <Route
          path={routes.citizen.application.contact.preview}
          render={(routerProps) => (
            <ContactPreview
              entity={entity}
              databox={databox}
              databoxURL={databoxURL}
              {...routerProps}
            />
          )}
        />
        <Route
          path={routes.citizen.application.contact.providers}
          exact
          render={(routerProps) => (
            <ContactProviders
              entity={entity}
              databox={databox}
              databoxURL={databoxURL}
              {...routerProps}
            />
          )}
        />
      </Switch>
    </Screen>
  );
};

Contact.propTypes = {
  mainDomain: PropTypes.string,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  screenProps: PropTypes.shape({
    state: SCREEN_STATE_PROPTYPES.isRequired,
  }).isRequired,

  // withDataboxURL
  databoxURL: PropTypes.string,
  databox: PropTypes.shape(DataboxSchema.propTypes),
  isNewDatabox: PropTypes.bool,
  isFetchingDatabox: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
};

Contact.defaultProps = {
  entity: null,
  mainDomain: null,
  databox: null,
  isNewDatabox: null,
  databoxURL: null,
};

export default withDataboxURL()(Contact);
