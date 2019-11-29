import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ArrowBack from '@material-ui/icons/ArrowBack';

import SearchApplications from 'components/smart/Search/Applications';

const useStyles = makeStyles((theme) => ({
  iconButton: { marginRight: theme.spacing(0.5) },
  search: { margin: 0 },
}));

function AppBarSearch({ onClose, open, searchBarProps }) {
  const classes = useStyles();

  return open && (
    <Toolbar>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={onClose}
        className={classes.iconButton}
      >
        <ArrowBack />
      </IconButton>
      <SearchApplications className={classes.search} {...searchBarProps} autoFocus />
    </Toolbar>
  );
}

AppBarSearch.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool,
  searchBarProps: PropTypes.objectOf(PropTypes.any),
};

AppBarSearch.defaultProps = {
  open: false,
  searchBarProps: {},
};

export default AppBarSearch;
