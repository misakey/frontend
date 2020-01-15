import React, { forwardRef } from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD, SEARCH_WIDTH_SM } from 'constants/ui/sizes';

import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    justifyContent: 'flex-start',
    [theme.breakpoints.up('sm')]: {
      width: SEARCH_WIDTH_SM,
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      margin: 0,
    },
    [theme.breakpoints.up('md')]: {
      width: SEARCH_WIDTH_MD,
    },
    [theme.breakpoints.up('lg')]: {
      width: SEARCH_WIDTH_LG,
    },
  },
  label: {
    textTransform: 'none',
  },
  contained: {
    backgroundColor: theme.palette.grey['200'],
  },
  startIcon: {
    marginRight: theme.spacing(2),
  },
}));

// COMPONENTS
const SearchApplicationsButton = forwardRef((props, ref) => {
  const classes = useStyles();

  return (
    <Button
      ref={ref}
      classes={{
        root: classes.root,
        label: classes.label,
        contained: classes.contained,
        startIcon: classes.startIcon,
      }}
      variant="contained"
      startIcon={<SearchIcon />}
      disableElevation
      {...props}
    />
  );
});

export default SearchApplicationsButton;
