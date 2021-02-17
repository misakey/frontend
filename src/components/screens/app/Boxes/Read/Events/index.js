import React, { useMemo, useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import ElevationScroll from 'components/dumb/ElevationScroll';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

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
import AppBarStatic from '@misakey/ui/AppBar/Static';
import useOnTabVisibilityChange from '@misakey/hooks/useOnTabVisibilityChange';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR, accountId: ACCOUNT_ID_SELECTOR } = authSelectors;

// HOOKS
const useStyles = makeStyles(() => ({
  content: ({ headerHeight }) => ({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    // Fallback to flex sizing. Do not use 100vh for mobile devices
    // https://dev.to/admitkard/mobile-issue-with-100vh-height-100-100vh-3-solutions-3nae
    height: `calc(100% - ${headerHeight}px)`,
    position: 'relative',
  }),
}));

// COMPONENTS
function BoxEvents({ box, t, belongsToCurrentUser }) {
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
  const isTabActive = useOnTabVisibilityChange();

  const shouldFetch = useMemo(
    () => !isNil(id) && !isNil(identityId) && eventsCount > 0 && isTabActive,
    [id, identityId, eventsCount, isTabActive],
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
        <AppBarStatic
          toolbarProps={{ px: 0 }}
        >
          <Box ref={headerRef} display="flex" flexDirection="column" width="100%" minHeight="inherit">
            <Box display="flex">
              <BoxEventsAppBar
                box={box}
                belongsToCurrentUser={belongsToCurrentUser}
              />
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
        </AppBarStatic>
      </ElevationScroll>
      <Box className={classes.content}>
        <PaginatedListBoxEvents
          key={id}
          ref={bindRefs}
          box={box}
        />
        <BoxEventsFooter
          box={box}
        />
      </Box>
    </BoxEventEditContext>
  );
}

BoxEvents.propTypes = {
  belongsToCurrentUser: PropTypes.bool.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes'])(BoxEvents);
