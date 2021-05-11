import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { MENU_FULLSCREEN, SMALL_MENU_WIDTH } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Popover from '@material-ui/core/Popover';

// HOOKS
const useStyles = makeStyles((theme) => ({
  popoverPaper: ({ fullScreen }) => ({
    width: fullScreen ? MENU_FULLSCREEN : SMALL_MENU_WIDTH,
    height: fullScreen ? '100%' : null,
    maxHeight: '100%',
    maxWidth: MENU_FULLSCREEN,
    [theme.breakpoints.down('sm')]: {
      width: MENU_FULLSCREEN,
      height: '100%',
    },
  }),
}));

// COMPONENTS
const PopoverFullScreen = ({ fullScreen, classes: { paper, ...rest }, ...props }) => {
  const internalClasses = useStyles({ fullScreen });
  return (
    <Popover
      classes={{
        paper: clsx(paper, internalClasses.popoverPaper),
        ...rest,
      }}
      marginThreshold={0}
      {...props}
    />
  );
};

PopoverFullScreen.propTypes = {
  fullScreen: PropTypes.bool,
  classes: PropTypes.shape({
    paper: PropTypes.string,
  }),
};

PopoverFullScreen.defaultProps = {
  fullScreen: false,
  classes: {},
};

export default PopoverFullScreen;
