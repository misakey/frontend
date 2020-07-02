import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from 'routes';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxAvatar from 'components/dumb/Avatar/Box';
import Title from 'components/dumb/Typography/Title';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ElevationScroll from 'components/dumb/ElevationScroll';

import MenuIcon from '@material-ui/icons/Menu';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { selectors } from '@misakey/crypto/store/reducer';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';

import useGroupEventsByDate from 'hooks/useGroupEventsByDate';
import useGeneratePathKeepingSearch from '@misakey/hooks/useGeneratePathKeepingSearch';
import isNil from '@misakey/helpers/isNil';

import BoxesSchema from 'store/schemas/Boxes';

import BoxEventsAccordingToType from 'components/smart/Box/Event';
import BoxEventsFooter from './Footer';

const APPBAR_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
  content: ({ headerHeight }) => ({
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${headerHeight}px)`,
  }),
  thread: {
    overflow: 'auto',
  },
  menuButton: {
    margin: theme.spacing(0, 1),
  },
  title: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.subtitle1.fontSize,
    },
  },
  subtitle: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.subtitle2.fontSize,
    },
  },
}));

function BoxEvents({ drawerWidth, isDrawerOpen, toggleDrawer, box, t }) {
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const lastEventRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const classes = useStyles({ headerHeight });

  const routeDetails = useGeneratePathKeepingSearch(routes.boxes.read.details, { id: box.id });

  const { avatarUri, title, events: boxEvents, members, publicKey } = useMemo(() => box, [box]);
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
            <Box px={2} display="flex">
              {!isDrawerOpen && (
                <IconButtonAppBar
                  color="inherit"
                  aria-label={t('common:openAccountDrawer')}
                  edge="start"
                  onClick={toggleDrawer}
                  className={classes.menuButton}
                >
                  <MenuIcon />
                </IconButtonAppBar>
              )}
              <Box display="flex" flexGrow={1} overflow="hidden" alignItems="flex-end">
                <Box display="flex" flexDirection="column">
                  <Title className={classes.title} gutterBottom={false} noWrap>
                    {title}
                  </Title>
                  <Subtitle className={classes.subtitle}>
                    {t('boxes:read.details.menu.members.count', { count: members.length })}
                  </Subtitle>
                </Box>
                <IconButtonAppBar
                  aria-label={t('boxes:read.details.open')}
                  aria-controls="menu-appbar"
                  component={Link}
                  to={routeDetails}
                >
                  <KeyboardArrowDownIcon />
                </IconButtonAppBar>

              </Box>

              <IconButtonAppBar
                aria-label={t('boxes:read.details.open')}
                aria-controls="menu-appbar"
                component={Link}
                to={routeDetails}
                edge="end"
              >
                <BoxAvatar
                  classes={{ root: classes.avatar }}
                  src={avatarUri}
                  title={title || ''}
                />
              </IconButtonAppBar>
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
