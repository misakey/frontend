import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { CLOSED } from 'constants/app/boxes/statuses';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import { useBoxesUploadContext } from 'components/smart/Input/Boxes/Upload/Context';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import makeStyles from '@material-ui/core/styles/makeStyles';
import isNil from '@misakey/helpers/isNil';

import ElevationScroll from 'components/dumb/ElevationScroll';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEmpty from 'components/dumb/Box/Empty';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import WindowedGridInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded/Grid';
import WindowedListAutoSized from 'components/smart/WindowedList/Autosized';
import usePaginateFileEventsByBox from 'hooks/usePaginateEventsByBox/Files';
import useTheme from '@material-ui/core/styles/useTheme';
import Cell, { Skeleton, CELL_HEIGHT } from './Cell';

const NUM_COLUMNS = 2;

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
  list: {
    overflowX: 'hidden !important',
  },
  fab: {
    position: 'absolute',
    bottom: 35,
    right: 35,
  },
}));

function BoxFiles({ belongsToCurrentUser, isDrawerOpen, toggleDrawer, box, t }) {
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const contentRef = useRef();

  const { onOpen: onOpenUploadDialog } = useBoxesUploadContext();

  const { id, lifecycle } = useMemo(() => box, [box]);
  const isClosed = useMemo(() => lifecycle === CLOSED, [lifecycle]);

  const classes = useStyles({ headerHeight });

  const headerRef = (ref) => {
    if (ref) { setHeaderHeight(ref.clientHeight); }
  };

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const numColumns = isSmall ? 1 : NUM_COLUMNS;

  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateFileEventsByBox(id);

  const itemData = useMemo(
    () => ({
      byPagination,
    }),
    [byPagination],
  );

  const displayLoading = useMemo(() => isNil(itemCount), [itemCount]);
  const displayEmpty = useMemo(() => itemCount === 0, [itemCount]);

  return (
    <>
      <ElevationScroll target={contentRef.current}>
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
          </Box>
        </AppBarDrawer>
      </ElevationScroll>
      <Box className={classes.content}>
        {displayLoading && <SplashScreen />}
        {displayEmpty && (
          <BoxEmpty title={t('boxes:read.files.empty')} py={0}>
            <Box display="flex" justifyContent="center" p={2}>
              <Button
                standing={BUTTON_STANDINGS.MAIN}
                text={t('boxes:read.files.add')}
                disabled={isClosed}
                onClick={onOpenUploadDialog}
              />
            </Box>
          </BoxEmpty>
        )}
        {!displayLoading && !displayEmpty && (
          <>
            <WindowedListAutoSized
              component={WindowedGridInfiniteLoaded}
              numColumns={numColumns}
              loadMoreItems={loadMoreItems}
              Cell={Cell}
              Skeleton={Skeleton}
              itemCount={itemCount}
              itemData={itemData}
              rowHeight={CELL_HEIGHT}
              ref={contentRef}
              className={classes.list}
            />
            <Fab
              className={classes.fab}
              color="secondary"
              aria-label="add"
              disabled={isClosed}
              onClick={onOpenUploadDialog}
            >
              <AddIcon />
            </Fab>
          </>
        )}
      </Box>
    </>

  );
}

BoxFiles.propTypes = {
  t: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default withTranslation('common')(BoxFiles);
