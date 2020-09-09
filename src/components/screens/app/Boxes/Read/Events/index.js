import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import { CLOSED } from 'constants/app/boxes/statuses';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import useGetShareMethods from 'hooks/useGetShareMethods';
import isNil from '@misakey/helpers/isNil';

import BoxesSchema from 'store/schemas/Boxes';

import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import InputBoxesUploadContext from 'components/smart/Input/Boxes/Upload/Context';
import BoxEventEditContext from 'components/smart/Box/Event/Edit/Context';
import PaginatedListBoxEvents from 'components/smart/PaginatedList/BoxEvents';
import BoxEventsFooter from './Footer';
import DeleteBoxDialogButton from './DeleteBoxDialogButton';

// HOOKS
const useStyles = makeStyles(() => ({
  content: ({ headerHeight }) => ({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${headerHeight}px)`,
  }),
  thread: {
    overflow: 'auto',
  },
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

  const {
    members,
    title,
    publicKey,
    id,
    lifecycle,
  } = useMemo(() => box, [box]);
  const { accountId } = useSelector(getCurrentUserSelector) || {};
  const {
    canShare,
    canInvite,
    onShare,
    onCopyLink,
  } = useGetShareMethods(id, title, publicKey, t);

  const isTheOnlyMember = useMemo(
    () => members.length === 1 && belongsToCurrentUser,
    [belongsToCurrentUser, members.length],
  );

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const canDeleteBox = useMemo(
    () => belongsToCurrentUser && isClosed,
    [belongsToCurrentUser, isClosed],
  );

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
            drawerWidth={drawerWidth}
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
                    text={t('common:add')}
                  />
                )}
              >
                {t('boxes:read.warning.saveInBackup')}
              </Alert>
              )}

              {!isClosed && isTheOnlyMember && canInvite && (
              <Alert
                severity="info"
                action={(
                  <Button
                    onClick={canShare ? onShare : onCopyLink}
                    standing={BUTTON_STANDINGS.TEXT}
                    text={t('common:share')}
                  />
                )}
              >
                {t('boxes:read.info.share')}
              </Alert>
              )}

              {canDeleteBox && (
              <Alert
                severity="error"
                action={<DeleteBoxDialogButton box={box} />}
              >
                {t('boxes:read.info.closed')}
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
