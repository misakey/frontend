import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Link } from 'react-router-dom';

import routes from 'routes';

import omit from '@misakey/helpers/omit';

import MUILink from '@material-ui/core/Link';
import Logo from 'components/dumb/Logo';

// CONSTANTS
const INTERNAL_PROPS = ['tReady'];

// HOOKS
const useStyles = makeStyles(() => ({
  linkRoot: {
    fontFamily: ['Futura Std Bold', 'Roboto', 'sans-serif'],
    display: 'flex',
  },
}));

// COMPONENTS
const LinkHome = ({ t, ...rest }) => {
  const classes = useStyles();

  return (
    <MUILink
      to={routes._}
      component={Link}
      underline="none"
      classes={{ root: classes.linkRoot }}
      color="secondary"
      variant="subtitle1"
      {...omit(rest, INTERNAL_PROPS)}
    >
      <Logo width={100} />
    </MUILink>
  );
};

LinkHome.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(LinkHome);
