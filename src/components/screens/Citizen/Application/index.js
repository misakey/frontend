import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import RoutePrivate from '@misakey/auth/components/Route/Private';
import withApplication from 'components/smart/withApplication';
import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';
import ApplicationNone from 'components/screens/Citizen/Application/None';
import ApplicationInfo from 'components/screens/Citizen/Application/Info';
import ApplicationContact from 'components/screens/Citizen/Application/Contact';

function Application({ entity, error, isFetching, mainDomain, match }) {
  return (
    <ResponseHandlerWrapper
      error={error}
      entity={entity}
      isFetching={isFetching}
    >
      <Switch>
        <RoutePrivate
          path={routes.citizen.application.contact._}
          component={ApplicationContact}
          componentProps={{ entity, error, isFetching, mainDomain }}
        />
        <Route
          path={routes.citizen.application.info}
          render={(routerProps) => (
            <ApplicationInfo
              entity={entity}
              error={error}
              isFetching={isFetching}
              {...routerProps}
            />
          )}
        />
        <Route exact path={match.path} component={ApplicationNone} />
      </Switch>
    </ResponseHandlerWrapper>
  );
}

Application.propTypes = {
  dispatch: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  error: PropTypes.object,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

Application.defaultProps = {
  entity: null,
  error: null,
  isFetching: true,
};

export default withApplication(Application);
