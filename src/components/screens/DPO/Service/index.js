import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import clsx from 'clsx';
import isNil from '@misakey/helpers/isNil';

import withApplication from 'components/smart/withApplication';

import RouteService, { DEFAULT_SERVICE_ENTITY } from 'components/smart/Route/Service';

import makeStyles from '@material-ui/core/styles/makeStyles';
import ButtonBurger from 'components/dumb/Button/Burger';
import Drawer from 'components/screens/DPO/Service/Drawer';
import ServiceClaim from 'components/screens/DPO/Service/Claim';
import ServiceRequests from 'components/screens/DPO/Service/Requests';
import Redirect from 'components/dumb/Redirect';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import SplashScreen from 'components/dumb/SplashScreen';
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import useUserHasRole from 'hooks/useUserHasRole';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD } from 'components/smart/Search/Applications';
import { ROLE_PREFIX_SCOPE } from 'constants/Roles';

export const DPO_SERVICE_SCREEN_NAMES = {
  CLAIM: 'DPOServiceClaim',
  REQUESTS: 'DPOServiceRequests',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarParent: (isDrawerOpen) => ({
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginLeft: theme.spacing(isDrawerOpen ? 0 : 2),
    [theme.breakpoints.up('md')]: {
      maxWidth: `calc(50% - ${SEARCH_WIDTH_MD / 2}px - ${theme.spacing(2)}px - 48px)`,
      '&.isDrawerOpen': { maxWidth: '100%' },
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: `calc(50% - ${SEARCH_WIDTH_LG / 2}px - ${theme.spacing(2)}px - 48px)`,
    },
  }),
}));

function Service({
  entity, isDefaultDomain, mainDomain, match, userId, isFetching, userRoles, ...rest
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const classes = useStyles(isDrawerOpen);

  const service = useMemo(
    () => (isDefaultDomain ? DEFAULT_SERVICE_ENTITY : entity),
    [isDefaultDomain, entity],
  );

  const workspace = useLocationWorkspace();
  const requiredScope = useMemo(() => service && `${ROLE_PREFIX_SCOPE}.${workspace}.${service.id}`, [service, workspace]);
  const userHasRole = useUserHasRole(userRoles, requiredScope);
  const routeServiceProps = useMemo(
    () => ({ requiredScope, workspace, mainDomain, userHasRole }),
    [mainDomain, requiredScope, userHasRole, workspace],
  );

  const appBarProps = useMemo(() => ({
    shift: isDrawerOpen,
    items: [!isDrawerOpen ? (
      <ButtonBurger key="ButtonBurger" onClick={() => setDrawerOpen(true)} />
    ) : null, (
      <div className={clsx(classes.avatarParent, { isDrawerOpen })} key="serviceAvatarParent">
        {!isDefaultDomain && service && <ApplicationAvatar application={service} />}
      </div>
    )],
  }), [classes.avatarParent, isDefaultDomain, isDrawerOpen, service]);

  if (isNil(service)) {
    return <SplashScreen />;
  }

  return (
    <Drawer
      mainDomain={mainDomain}
      onClose={() => setDrawerOpen(false)}
      open={isDrawerOpen}
      userHasRole={userHasRole}
    >
      <Switch>
        <RouteService
          path={routes.dpo.service.claim._}
          component={ServiceClaim}
          componentProps={{
            appBarProps,
            isLoading: isFetching,
            name: DPO_SERVICE_SCREEN_NAMES.CLAIM,
            service,
            userId,
            userRoles,
            ...rest,
          }}
          {...routeServiceProps}
        />
        <RouteService
          path={routes.dpo.service.requests._}
          component={ServiceRequests}
          componentProps={{
            appBarProps,
            isLoading: isFetching,
            service,
            name: DPO_SERVICE_SCREEN_NAMES.REQUESTS,
            ...rest,
          }}
          {...routeServiceProps}
        />
        <Redirect
          from={match.path}
          to={routes.dpo.service.requests._}
        />
      </Switch>
    </Drawer>
  );
}

Service.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  isDefaultDomain: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  mainDomain: PropTypes.string.isRequired,
  match: PropTypes.shape({ path: PropTypes.string }).isRequired,
  userId: PropTypes.string,
  userRoles: PropTypes.arrayOf(PropTypes.shape({
    roleLabel: PropTypes.string.isRequired,
    applicationId: PropTypes.string.isRequired,
  })).isRequired,
};

Service.defaultProps = {
  entity: null,
  userId: null,
};

export default withApplication(Service);
