import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';

// HOOKS
const useStyles = makeStyles(() => ({
  menuList: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const PaperMenuList = forwardRef(({ children, ...props }, ref) => {
  const classes = useStyles();
  return (
    <Paper ref={ref} {...props}>
      <MenuList
        classes={{
          root: classes.menuList,
        }}
        disablePadding
      >
        {children}
      </MenuList>
    </Paper>
  );
});

PaperMenuList.propTypes = {
  children: PropTypes.node,
};

PaperMenuList.defaultProps = {
  children: null,
};

export default PaperMenuList;
