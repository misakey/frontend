import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import ApplicationAvatar from 'components/dumb/Avatar/Application';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import withApplication from 'components/smart/withApplication';
import ResponseHandlerWrapper from '@misakey/ui/ResponseHandlerWrapper';
import Portal from '@misakey/ui/Portal';
import ApplicationNone from 'components/screens/Citizen/Application/None';
import ApplicationInfo from 'components/screens/Citizen/Application/Info';
import ApplicationContact from 'components/screens/Citizen/Application/Contact';
import ApplicationFeedback from 'components/screens/Citizen/Application/Feedback';

import { LEFT_PORTAL_ID } from 'components/smart/Layout';


const PAGES_ROSES_ENDPOINT = {
  method: 'GET',
  path: '/applications',
};

function Application({ entity, error, isFetching, mainDomain, match }) {
  return (
    <ResponseHandlerWrapper
      error={error}
      entity={entity}
      isFetching={isFetching}
    >
      <>
        <Portal elementId={LEFT_PORTAL_ID}>
          <ApplicationAvatar application={entity} />
        </Portal>
        <Switch>
          <RoutePrivate
            path={routes.citizen.application.contact._}
            component={ApplicationContact}
            componentProps={{ entity, error, isFetching, mainDomain }}
          />
          <Route path={routes.citizen.application.feedback._} component={ApplicationFeedback} />

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
      </>
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

export default withApplication(Application, { endpoint: PAGES_ROSES_ENDPOINT });
