import React, { useMemo, useState, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { ICONBUTTON_WIDTH } from '@misakey/ui/constants/sizes';
import BoxesSchema from 'store/schemas/Boxes';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import isPlainObject from '@misakey/helpers/isPlainObject';
import getScrollDiff from '@misakey/helpers/getScrollDiff';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useBoxEventSubmitContext } from 'components/smart/Box/Event/Submit/Context';
import { useBoxesContext } from 'components/smart/Context/Boxes';
import useOnTabVisibilityChange from '@misakey/hooks/useOnTabVisibilityChange';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import BoxEventsAppBar, { HEADER_MIN_HEIGHT } from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEventEditContext from 'components/smart/Box/Event/Edit/Context';
import PaginatedListBoxEvents from 'components/smart/PaginatedList/BoxEvents';
import BoxEventsFooter from 'components/screens/app/Boxes/Read/Events/Footer';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import ButtonWithDialogPassword from '@misakey/react-auth/components/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import ElevationScroll from '@misakey/ui/ElevationScroll';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Grow from '@material-ui/core/Grow';

import ArrowDownWardIcon from '@material-ui/icons/ArrowDownward';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR, accountId: ACCOUNT_ID_SELECTOR } = authSelectors;

// @FIXME to test
const SCROLL_THRESHOLD = 1;
const BADGE_ORIGIN = {
  vertical: 'top',
  horizontal: 'left',
};

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
  scrollBottomButton: {
    position: 'absolute',
    bottom: 64,
    right: 0,
  },
  scrollBottomBadge: {
    left: ICONBUTTON_WIDTH / 2,
  },
}));

// COMPONENTS
function BoxEvents({ box, t, belongsToCurrentUser }) {
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const [isScrolledBottom, setIsScrolledBottom] = useState(true);
  const { listRef, scrollToBottom } = useBoxEventSubmitContext();
  const [headerHeight, setHeaderHeight] = useState(HEADER_MIN_HEIGHT);
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
    () => !isNil(id) && !isNil(identityId) && eventsCount > 0 && isTabActive && isScrolledBottom,
    [id, identityId, eventsCount, isTabActive, isScrolledBottom],
  );

  const onResetBoxEventCount = useCallback(
    () => {
      onAckWSUserBox(id);
    },
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

  const onScroll = useCallback(
    (e) => {
      const { target } = e;
      const scrollDiff = getScrollDiff(target);
      if (scrollDiff > 0) {
        const distanceToBottom = scrollDiff - target.scrollTop;
        setIsScrolledBottom(distanceToBottom < SCROLL_THRESHOLD);
        if (shouldFetch) {
          onResetBoxEventCount();
        }
      }
    },
    [shouldFetch, onResetBoxEventCount, setIsScrolledBottom],
  );

  useFetchEffect(onResetBoxEventCount, { shouldFetch });
  useEffect(
    () => {
      scrollToBottom();
    },
    [headerHeight, scrollToBottom],
  );

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
          onScroll={onScroll}
        />
        <Grow in={eventsCount > 0 && !isScrolledBottom} mountOnEnter>
          <Badge
            color="primary"
            badgeContent={eventsCount}
            anchorOrigin={BADGE_ORIGIN}
            classes={{
              root: classes.scrollBottomButton,
              badge: classes.scrollBottomBadge,
            }}
          >
            <IconButton aria-label={t('common:scrollToBottom')} color="primary" onClick={scrollToBottom}>
              <ArrowDownWardIcon />
            </IconButton>
          </Badge>
        </Grow>
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

export default withTranslation(['boxes', 'common'])(BoxEvents);
