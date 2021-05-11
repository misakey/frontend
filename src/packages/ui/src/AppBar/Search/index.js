import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { fade } from '@material-ui/core/styles';

import AppBarStatic from '@misakey/ui/AppBar/Static';

// CONSTANTS
const TOOLBAR_PROPS = {
  px: 0.5,
  m: 2,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  toolbarRoot: {
    backgroundColor: fade(theme.palette.reverse.background.default, 0.05),
    borderRadius: theme.shape.borderRadius,
  },
}));

// COMPONENTS
const AppBarSearch = forwardRef(({ toolbarProps, ...props }, ref) => {
  const classes = useStyles();

  const searchToolbarProps = useMemo(
    () => ({
      classes: { root: classes.toolbarRoot },
      ...TOOLBAR_PROPS,
      ...toolbarProps,
    }),
    [classes.toolbarRoot, toolbarProps],
  );

  return (
    <AppBarStatic ref={ref} toolbarProps={searchToolbarProps} {...props} />
  );
});

AppBarSearch.propTypes = {
  toolbarProps: PropTypes.object,
};

AppBarSearch.defaultProps = {
  toolbarProps: {},
};

export default AppBarSearch;
