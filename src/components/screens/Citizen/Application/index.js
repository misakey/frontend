import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import { makeStyles } from '@material-ui/core/styles';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import withApplication from 'components/smart/withApplication';
import Portal from 'components/dumb/Portal';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';

import ApplicationNone from 'components/screens/Citizen/Application/None';
import ApplicationInfo from 'components/screens/Citizen/Application/Info';
import ApplicationContact from 'components/screens/Citizen/Application/Contact';
import ApplicationFeedback from 'components/screens/Citizen/Application/Feedback';

import isEmpty from '@misakey/helpers/isEmpty';
import isNumber from '@misakey/helpers/isNumber';
import isString from '@misakey/helpers/isString';
import ErrorOverlay from 'components/dumb/Error/Overlay';
import { LEFT_PORTAL_ID } from 'components/smart/Layout';
import SplashScreen from 'components/dumb/SplashScreen';

// CONSTANTS
const PAGES_ROSES_ENDPOINT = {
  method: 'GET',
  path: '/applications/:mainDomain',
};

// HOOKS
const useStyles = makeStyles(() => ({
  portalAvatar: {
    overflow: 'hidden',
  },
}));

function Application({ entity, error, isFetching, mainDomain, match }) {
  const classes = useStyles();
  const application = useMemo(
    () => (isFetching ? { mainDomain } : entity),
    [mainDomain, entity, isFetching],
  );
  // @FIXME use ResponseHandlerWrapper
  if (isString(error) || isNumber(error)) { return <ErrorOverlay httpStatus={error} />; }
  if (!window.env.PLUGIN && isFetching && isEmpty(entity)) { return <SplashScreen />; }

  return (
    <>
      {application && (
        <Portal elementId={LEFT_PORTAL_ID} className={classes.portalAvatar}>
          <ApplicationAvatar application={application} />
        </Portal>
      )}
      <Switch>
        <RoutePrivate
          path={routes.citizen.application.contact._}
          component={ApplicationContact}
          componentProps={{ entity: application, error, isFetching, mainDomain }}
        />
        <Route path={routes.citizen.application.feedback._} component={ApplicationFeedback} />

        <Route
          path={routes.citizen.application.info}
          render={(routerProps) => (
            <ApplicationInfo
              entity={application}
              error={error}
              isFetching={isFetching}
              {...routerProps}
            />
          )}
        />
        <Route exact path={match.path} component={ApplicationNone} />
      </Switch>
    </>
  );
}

Application.propTypes = {
  dispatch: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  error: PropTypes.number,
  isFetching: PropTypes.bool,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
};

Application.defaultProps = {
  entity: null,
  error: null,
  isFetching: true,
};

export default withApplication(Application, {
  endpoint: PAGES_ROSES_ENDPOINT,
  paramMapper: (props) => [props],
  getSpecificShouldFetch: compose(isNil, prop('avgRating')),
});
