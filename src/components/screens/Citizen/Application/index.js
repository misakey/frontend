import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import { makeStyles } from '@material-ui/core/styles';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import withApplication from 'components/smart/withApplication';
import isNil from '@misakey/helpers/isNil';

import ApplicationNone from 'components/screens/Citizen/Application/None';
import ApplicationInfo from 'components/screens/Citizen/Application/Info';
import ApplicationContact from 'components/screens/Citizen/Application/Contact';
import ApplicationFeedback from 'components/screens/Citizen/Application/Feedback';

import isEmpty from '@misakey/helpers/isEmpty';

import Screen from 'components/dumb/Screen';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD } from 'components/smart/Search/Applications';
import { IS_PLUGIN } from 'constants/plugin';

// CONSTANTS
const PAGES_ROSES_ENDPOINT = {
  method: 'GET',
  path: '/applications/:mainDomain',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarParent: {
    // Maybe this style should be more documented
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    [theme.breakpoints.up('md')]: {
      maxWidth: `calc(50% - ${SEARCH_WIDTH_MD / 2}px - ${theme.spacing(2)}px)`,
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: `calc(50% - ${SEARCH_WIDTH_LG / 2}px - ${theme.spacing(2)}px)`,
    },
  },
}));

function Application({ entity, error, isFetching, mainDomain, match }) {
  const classes = useStyles();
  const application = useMemo(
    () => ((isFetching || isNil(entity)) ? { mainDomain } : entity),
    [mainDomain, entity, isFetching],
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: !IS_PLUGIN && isFetching && isEmpty(entity),
    }),
    [error, isFetching, entity],
  );

  const appBarProps = useMemo(
    () => ({
      items: [(
        <div className={classes.avatarParent} key="applicationAvatarParent">
          {application && (
            <ApplicationAvatar
              application={application}
              displayRating={IS_PLUGIN}
              displayMainDomain={IS_PLUGIN}
            />
          )}
        </div>
      )],
    }),
    [application, classes.avatarParent],
  );

  return (
    <Screen state={state} appBarProps={appBarProps} disableGutters={IS_PLUGIN}>
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
    </Screen>
  );
}

Application.propTypes = {
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

export default withApplication(Application, {
  endpoint: PAGES_ROSES_ENDPOINT,
  paramMapper: (props) => [props],
  getSpecificShouldFetch: (entity) => {
    const { avgRating, unknown } = entity || {};
    return isNil(avgRating) && unknown !== true;
  },
});
