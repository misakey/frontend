import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useBoxEventSubmitContext } from 'components/smart/Box/Event/Submit/Context';
import { useBoxesContext } from 'components/smart/Context/Boxes';

import isNil from '@misakey/helpers/isNil';
import isPlainObject from '@misakey/helpers/isPlainObject';

import BoxesSchema from 'store/schemas/Boxes';

import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEventEditContext from 'components/smart/Box/Event/Edit/Context';
import PaginatedListBoxEvents from 'components/smart/PaginatedList/BoxEvents';
import BoxEventsFooter from 'components/screens/app/Boxes/Read/Events/Footer';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR, accountId: ACCOUNT_ID_SELECTOR } = authSelectors;

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
  const { listRef } = useBoxEventSubmitContext();
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const classes = useStyles({ headerHeight });

  const { id, eventsCount } = useMemo(() => box, [box]);

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const headerRef = (ref) => {
    if (ref) { setHeaderHeight(ref.clientHeight); }
  };


  // RESET BOX COUNT
  const { onAckWSUserBox } = useBoxesContext();

  const shouldFetch = useMemo(
    () => !isNil(id) && !isNil(identityId) && eventsCount > 0,
    [id, identityId, eventsCount],
  );

  const onResetBoxEventCount = useCallback(
    () => onAckWSUserBox(id),
    [onAckWSUserBox, id],
  );

  const bindRefs = useCallback(
    (ref) => {
      setContentRef(ref);
      if (isPlainObject(ref)) {
        listRef.current = ref;
      }
    },
    [setContentRef, listRef],
  );

  useFetchEffect(onResetBoxEventCount, { shouldFetch });

  return (
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
                    <ArrowBack />
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
                    text={t('boxes:closedVault.create')}
                  />
                )}
              >
                {t('boxes:closedVault.saveForLater')}
              </Alert>
            )}
          </Box>
        </AppBarDrawer>
      </ElevationScroll>
      <Box className={classes.content}>
        <PaginatedListBoxEvents
          key={id}
          ref={bindRefs}
          box={box}
        />
        <BoxEventsFooter
          box={box}
          drawerWidth={drawerWidth}
          isDrawerOpen={isDrawerOpen}
        />
      </Box>
    </BoxEventEditContext>
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
