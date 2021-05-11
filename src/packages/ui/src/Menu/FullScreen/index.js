import React from 'react';

import { MENU_FULLSCREEN, SMALL_MENU_WIDTH } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Menu from '@material-ui/core/Menu';

// HOOKS
const useStyles = makeStyles((theme) => ({
  menuPaper: () => ({
    width: SMALL_MENU_WIDTH,
    maxHeight: '100%',
    maxWidth: MENU_FULLSCREEN,
    [theme.breakpoints.down('sm')]: {
      width: MENU_FULLSCREEN,
      height: '100%',
    },
  }),
  menuList: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const MenuFullScreen = (props) => {
  const classes = useStyles();
  return (
    <Menu
      classes={{
        paper: classes.menuPaper,
        list: classes.menuList,
      }}
      marginThreshold={0}
      MenuListProps={{
        disablePadding: true,
      }}
      {...props}
    />
  );
};

export default MenuFullScreen;
