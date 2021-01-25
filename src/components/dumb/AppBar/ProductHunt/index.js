import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { AVATAR_SIZE, PRODUCT_HUNT_APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: theme.zIndex.drawer + 1,
    maxHeight: PRODUCT_HUNT_APPBAR_HEIGHT,
    backgroundColor: theme.palette.reverse.background.default,
  },
  toolbar: {
    color: theme.palette.background.default,
  },
  title: {
    color: theme.palette.background.default,
    flexGrow: 1,
    textAlign: 'center',
    [theme.breakpoints.only('xs')]: {
      lineHeight: 1,
    },
  },
  logo: {
    marginRight: theme.spacing(2),
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
}));

// COMPONENTS
const AppBarProductHunt = ({ t, position }) => {
  const classes = useStyles();

  if (!window.env.PRODUCT_HUNT.BANNER) {
    return null;
  }

  return (
    <AppBar variant="outlined" position={position} className={classes.root}>
      <Toolbar
        className={classes.toolbar}
        component={Link}
        href={window.env.PRODUCT_HUNT.URL}
        target="_blank"
        rel="noopener noreferrer"
        variant="dense"
      >
        <img src="/ico/product-hunt.svg" alt={t('components:productHunt.title')} className={classes.logo} />
        <Typography variant="subtitle1" className={classes.title}>
          {t('components:productHunt.title')}
        </Typography>
        <ChevronRightIcon />
      </Toolbar>
    </AppBar>
  );
};

AppBarProductHunt.propTypes = {
  position: PropTypes.oneOf(['absolute', 'fixed', 'relative', 'static', 'sticky']),
  // withTranslation
  t: PropTypes.func.isRequired,
};

AppBarProductHunt.defaultProps = {
  position: 'fixed',
};

export default withTranslation('components')(AppBarProductHunt);
