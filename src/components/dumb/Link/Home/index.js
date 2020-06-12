import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Link } from 'react-router-dom';

import routes from 'routes';

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

  const routingProps = useMemo(
    () => ({ component: Link, to: routes._ }),
    [],
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
