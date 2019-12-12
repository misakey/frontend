import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import ApplicationSchema from 'store/schemas/Application';


import routes from 'routes';

import withApplication from 'components/smart/withApplication';
import withDataboxURL from 'components/smart/withDataboxURL';

// LAZY
const ContactPreview = lazy(() => import('components/screens/Citizen/Application/Contact/Preview'));
const ContactProviders = lazy(() => import('components/screens/Citizen/Application/Contact/Providers'));

// COMPONENTS
const Contact = ({
  entity,
  databoxURL,
}) => (
  <Switch>
    <Route
      path={routes.citizen.application.contact.preview}
      render={(routerProps) => (
        <ContactPreview entity={entity} databoxURL={databoxURL} {...routerProps} />
      )}
    />
    <Route
      path={routes.citizen.application.contact.providers}
      exact
      render={(routerProps) => (
        <ContactProviders entity={entity} databoxURL={databoxURL} {...routerProps} />
      )}
    />
  </Switch>
);

Contact.propTypes = {
  mainDomain: PropTypes.string,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databoxURL: PropTypes.string,
};

Contact.defaultProps = {
  entity: null,
  mainDomain: null,
  databoxURL: null,
};

export default withDataboxURL()(withApplication(Contact));
