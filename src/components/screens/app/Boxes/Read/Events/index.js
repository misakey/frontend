import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import BoxesSchema from 'store/schemas/Boxes';

import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import InputBoxesUploadContext from 'components/smart/Input/Boxes/Upload/Context';
import BoxEventEditContext from 'components/smart/Box/Event/Edit/Context';
import PaginatedListBoxEvents from 'components/smart/PaginatedList/BoxEvents';
import BoxEventsFooter from './Footer';

// HOOKS
const useStyles = makeStyles(() => ({
  content: ({ headerHeight }) => ({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    // Do not use 100vh for mobile devices
    // https://dev.to/admitkard/mobile-issue-with-100vh-height-100-100vh-3-solutions-3nae
    height: `calc(100% - ${headerHeight}px)`,
    position: 'relative',
  }),
}));

// COMPONENTS
function BoxEvents({
  drawerWidth, isDrawerOpen, toggleDrawer, box, t, belongsToCurrentUser,
}) {
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  // const [lastEventRef, setLastEventRef] = useState();
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const classes = useStyles({ headerHeight });

  const [isMenuActionOpen, setIsMenuActionOpen] = useState(false);

  const onOpenMenuAction = useCallback(() => {
    setIsMenuActionOpen(true);
  }, [setIsMenuActionOpen]);

  const onCloseMenuAction = useCallback(() => {
    setIsMenuActionOpen(false);
  }, [setIsMenuActionOpen]);

  const { id } = useMemo(() => box, [box]);
  const { accountId } = useSelector(getCurrentUserSelector) || {};

  const headerRef = (ref) => {
    if (ref) { setHeaderHeight(ref.clientHeight); }
  };

  // const scrollToBottom = useCallback(
  //   () => {
  //     if (!isNil(lastEventRef)) { lastEventRef.scrollIntoView(); }
  //   },
  //   [lastEventRef],
  // );

  // // lastEventRef.current to scroll on bottom when dom is ready
  // // nbOfEvents to scroll at bottom when events are added by autoRefresh
  // useEffect(scrollToBottom, [scrollToBottom, nbOfEvents]);

  return (
    <InputBoxesUploadContext box={box} onSuccess={onCloseMenuAction}>
      <BoxEventEditContext>
        <ElevationScroll target={contentRef}>
          <AppBarDrawer
            isDrawerOpen={isDrawerOpen}
            toolbarProps={{ px: 0 }}
            offsetHeight={headerHeight}
          >
            <Box ref={headerRef} display="flex" flexDirection="column" width="100%" minHeight="inherit">
              <Box display="flex">
                {!isDrawerOpen && (
                <Box display="flex" alignItems="center" pl={2} pr={1}>
                  <IconButtonAppBar
                    aria-label={t('common:openAccountDrawer')}
                    edge="start"
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButtonAppBar>
                </Box>
                )}
                <BoxEventsAppBar box={box} belongsToCurrentUser={belongsToCurrentUser} />
              </Box>
              {isNil(accountId) && (
              <Alert
                severity="warning"
                action={(
                  <ButtonWithDialogPassword
                    standing={BUTTON_STANDINGS.TEXT}
                    text={t('boxes:read.warning.button')}
                  />
                )}
              >
                {t('boxes:read.warning.saveInBackup')}
              </Alert>
              )}
            </Box>
          </AppBarDrawer>
        </ElevationScroll>
        <Box className={classes.content}>
          <PaginatedListBoxEvents
            key={id}
            ref={(ref) => setContentRef(ref)}
            box={box}
          />
          <BoxEventsFooter
            box={box}
            drawerWidth={drawerWidth}
            isDrawerOpen={isDrawerOpen}
            isMenuActionOpen={isMenuActionOpen}
            onOpen={onOpenMenuAction}
            onClose={onCloseMenuAction}
          />
        </Box>
      </BoxEventEditContext>
    </InputBoxesUploadContext>
  );
}

BoxEvents.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEvents);
