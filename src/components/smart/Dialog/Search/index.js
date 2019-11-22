import React, { useMemo, forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useTheme, makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useLocationSearchParams from 'hooks/useLocationSearchParams';
import useLocationRole from 'hooks/useLocationRole';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';


import ElevationScroll from 'components/dumb/ElevationScroll';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { NAV_HEIGHT } from 'components/smart/Layout';

import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogSearchInput from './Input';
import DialogSearchList from './List';

// CONSTANTS
const MAX_WIDTH = 'md';
const BREAK_FULLSCREEN = 'sm';

// HELPERS
const searchProp = prop('search');

// HOOKS
const useStyles = makeStyles(() => ({
  dialogPaper: {
    height: '100%',
    maxHeight: 'none',
    margin: '0',
  },
  toolbar: {
    height: NAV_HEIGHT,
  },
  dialogContentRoot: {
    height: `calc(100% - ${NAV_HEIGHT}px)`,
    padding: '0',
  },
}));

// COMPONENTS
const Transition = forwardRef((props, ref) => (
  <Slide direction="down" ref={ref} {...props} />
));


const DialogSearch = ({ history: { replace, goBack }, t }) => {
  const classes = useStyles();
  const theme = useTheme();

  const fullScreen = useMediaQuery(theme.breakpoints.down(BREAK_FULLSCREEN));

  const locationSearchParams = useLocationSearchParams();
  const locationRole = useLocationRole();

  const search = useMemo(
    () => searchProp(locationSearchParams),
    [locationSearchParams],
  );

  const open = useMemo(
    () => !isNil(search),
    [search],
  );

  const onClose = useCallback(
    () => {
      goBack();
    },
    [goBack],
  );

  const onChange = useCallback(
    (value) => {
      const nextSearch = new URLSearchParams(locationSearchParams);
      nextSearch.set('search', value);
      replace({
        search: nextSearch.toString(),
      });
    },
    [locationSearchParams, replace],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      maxWidth={MAX_WIDTH}
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      classes={{ paper: classes.dialogPaper }}
    >
      <ElevationScroll>
        <AppBar
          position="relative"
          color="inherit"
          elevation={0}
        >
          <Toolbar className={classes.toolbar}>
            <Box mr={2} mt={1}>
              <IconButton onClick={onClose} aria-label={t('nav:search.button.close')}>
                <ArrowBackIcon />
              </IconButton>
            </Box>
            <DialogSearchInput
              onChange={onChange}
              placeholder={t('nav:search.placeholder')}
              aria-label={t('nav:search.label')}
              value={search}
              autoFocus
            />
            {/* <InputSearchRedirect /> */}
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <DialogContent classes={{ root: classes.dialogContentRoot }}>
        <DialogSearchList value={search} role={locationRole} />
      </DialogContent>
    </Dialog>
  );
};

DialogSearch.propTypes = {
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  history: PropTypes.shape({ replace: PropTypes.func, goBack: PropTypes.func }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('nav')(DialogSearch);
