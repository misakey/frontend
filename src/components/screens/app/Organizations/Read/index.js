import React, { useMemo } from 'react';
import { Redirect, Switch, useRouteMatch } from 'react-router-dom';

import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import ScreenDrawerContextProvider from 'components/smart/Screen/Drawer';
import DrawerOrganizationContent from 'components/smart/Drawer/Organization/Content';
import RouteAcr from '@misakey/react-auth/components/Route/Acr';
import OrganizationsReadSecret from 'components/screens/app/Organizations/Read/Secret';
import isSelfOrg from 'helpers/isSelfOrg';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGetOrgFromSearch from '@misakey/react-auth/hooks/useGetOrgFromSearch';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerContent: {
    position: 'relative',
    overflow: 'auto',
  },
}));

// COMPONENTS
const OrganizationsRead = (props) => {
  const classes = useStyles();
  const { path } = useRouteMatch();
  const { organization } = useGetOrgFromSearch();
  const { currentIdentityRole, id: orgId } = useSafeDestr(organization);

  const backTo = useGeneratePathKeepingSearchAndHash(routes.boxes._);
  const redirectToSecret = useGeneratePathKeepingSearchAndHash(routes.organizations.secret);

  const isAllowedToSeeSecret = useMemo(
    () => !isSelfOrg(orgId) && currentIdentityRole === ADMIN,
    [orgId, currentIdentityRole],
  );

  return (
    <ScreenDrawerContextProvider
      classes={{ content: classes.drawerContent }}
      drawerChildren={<DrawerOrganizationContent backTo={backTo} />}
      {...props}
    >
      <Switch>
        {isAllowedToSeeSecret && (
          <RouteAcr
            acr={2}
            exact
            path={routes.organizations.secret}
            component={OrganizationsReadSecret}
          />
        )}
        <Redirect
          from={path}
          to={redirectToSecret}
        />
      </Switch>
    </ScreenDrawerContextProvider>
  );
};

export default OrganizationsRead;
