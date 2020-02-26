import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Link } from 'react-router-dom';

import routes from 'routes';
import { IS_PLUGIN } from 'constants/plugin';
import { WORKSPACE } from 'constants/workspaces';

import isNil from '@misakey/helpers/isNil';
import { redirectToApp } from '@misakey/helpers/plugin';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import MUILink from '@material-ui/core/Link';

// HOOKS
const useStyles = makeStyles(() => ({
  linkRoot: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
}));

// COMPONENTS
const LinkHome = ({ children, ...rest }) => {
  const classes = useStyles();

  const workspace = useLocationWorkspace(true);

  // specific behaviour for account workspace
  const isAccountWorkspace = useMemo(
    () => workspace === WORKSPACE.ACCOUNT,
    [workspace],
  );


  const to = useMemo(
    () => {
      if (isAccountWorkspace) {
        return routes.citizen._;
      }
      if (isNil(workspace)) {
        return routes._;
      }
      return routes[workspace]._ || routes._;
    },
    [isAccountWorkspace, workspace],
  );

  const onClick = useCallback(
    () => redirectToApp(to),
    [to],
  );

  const routingProps = useMemo(
    () => (IS_PLUGIN
      ? { onClick, component: 'button' }
      : { component: Link, to }),
    [onClick, to],
  );

  return (
    <MUILink
      {...routingProps}
      underline="none"
      classes={{ root: classes.linkRoot }}
      {...rest}
    >
      {children}
    </MUILink>
  );
};

LinkHome.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LinkHome;
