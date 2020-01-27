import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';


import routes from 'routes';

import withDataboxURL from 'components/smart/withDataboxURL';

import Screen from 'components/dumb/Screen';

// LAZY
const ContactPreview = lazy(() => import('components/screens/Citizen/Application/Contact/Preview'));
const ContactProviders = lazy(() => import('components/screens/Citizen/Application/Contact/Providers'));

// COMPONENTS
const Contact = ({
  entity,
  databoxURL,
  databox,
  screenProps,
}) => (
  <Screen {...screenProps}>
    <Switch>
      <Redirect
        exact
        from={routes.citizen.application.contact._}
        to={routes.citizen.application.contact.preview}
      />
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

Contact.propTypes = {
  mainDomain: PropTypes.string,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  databoxURL: PropTypes.string,
  screenProps: PropTypes.object.isRequired,
};

Contact.defaultProps = {
  entity: null,
  mainDomain: null,
  databox: null,
  databoxURL: null,
};

export default withDataboxURL()(Contact);
