import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ElevationScroll from 'components/dumb/ElevationScroll';

import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { selectors } from '@misakey/crypto/store/reducer';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';

import useGroupEventsByDate from 'hooks/useGroupEventsByDate';
import isNil from '@misakey/helpers/isNil';

import BoxesSchema from 'store/schemas/Boxes';

import BoxEventsAccordingToType from 'components/smart/Box/Event';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEventsFooter from './Footer';

const APPBAR_HEIGHT = 64;

const useStyles = makeStyles(() => ({
  content: ({ headerHeight }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${headerHeight}px)`,
  }),
  thread: {
    overflow: 'auto',
  },
}));

function BoxEvents({ drawerWidth, isDrawerOpen, toggleDrawer, box, t }) {
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const lastEventRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const classes = useStyles({ headerHeight });

  const { events: boxEvents, publicKey } = useMemo(() => box, [box]);
  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(publicKey);

  const eventsByDate = useGroupEventsByDate(boxEvents);

  const headerRef = (ref) => {
    if (ref) { setHeaderHeight(ref.clientHeight); }
  };


  const scrollToBottom = useCallback(() => {
    if (!isNil(lastEventRef) && !isNil(lastEventRef.current)) {
      lastEventRef.current.scrollIntoView();
    }
  }, []);

  useEffect(scrollToBottom, [eventsByDate]);

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer
          drawerWidth={drawerWidth}
          toolbarProps={{ px: 0 }}
          offsetHeight={headerHeight}
        >
          <Box ref={headerRef} display="flex" flexDirection="column" width="100%">
            <Box display="flex">
              {!isDrawerOpen && (
                <Box display="flex" pl={2} pr={1}>
                  <IconButtonAppBar
                    color="inherit"
                    aria-label={t('common:openAccountDrawer')}
                    edge="start"
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButtonAppBar>
                </Box>
              )}
              <BoxEventsAppBar box={box} />
            </Box>

            {!isCryptoLoaded && canBeDecrypted && (
              <Alert
                severity="warning"
                action={<ButtonWithDialogPassword text={t('common:save')} />}
              >
                {t('boxes:read.warning.saveInBackup')}
              </Alert>
            )}
            {!isCryptoLoaded && !canBeDecrypted && (
              <Alert
                severity="warning"
                action={<ButtonWithDialogPassword text={t('common:decrypt')} />}
              >
                {t('boxes:read.warning.vaultClosed')}
              </Alert>
            )}
            {isCryptoLoaded && !canBeDecrypted && (
              <Alert severity="warning">
                {t('boxes:read.warning.undecryptable')}
              </Alert>
            )}
          </Box>
        </AppBarDrawer>
      </ElevationScroll>
      <Box className={classes.content}>
        <Box p={2} ref={(ref) => setContentRef(ref)} display="flex" flexGrow="1" flexDirection="column" className={classes.thread}>
          {eventsByDate.map(({ date, events }) => (
            <Box display="flex" flexDirection="column" py={1} key={date}>
              <Typography component={Box} alignSelf="center">{date}</Typography>
              {
              events.map((event) => (
                <BoxEventsAccordingToType event={event} key={event.id} boxID={box.id} />
              ))
            }
              <div ref={lastEventRef} />
            </Box>
          ))}
        </Box>
        <BoxEventsFooter
          box={box}
          drawerWidth={drawerWidth}
          isDrawerOpen={isDrawerOpen}
        />
      </Box>
    </>

  );
}

BoxEvents.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEvents);
