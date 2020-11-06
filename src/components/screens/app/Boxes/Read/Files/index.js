import React, { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { CLOSED } from 'constants/app/boxes/statuses';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import { useBoxesUploadContext } from 'components/smart/Input/Boxes/Upload/Context';

import Box from '@material-ui/core/Box';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import makeStyles from '@material-ui/core/styles/makeStyles';
import isNil from '@misakey/helpers/isNil';

import ElevationScroll from 'components/dumb/ElevationScroll';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEmpty from 'components/dumb/Box/Empty';
import ToggleDrawerButton from 'components/dumb/AppBar/Drawer/ToggleButton';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import FabAdd from '@misakey/ui/Fab/Add';

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
}));

function BoxFiles({ belongsToCurrentUser, isDrawerOpen, toggleDrawer, box }) {
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const contentRef = useRef();
  const { t } = useTranslation('boxes');

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
              <ToggleDrawerButton isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
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
            <FabAdd
              disabled={isClosed}
              onClick={onOpenUploadDialog}
            />
          </>
        )}
      </Box>
    </>

  );
}

BoxFiles.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default BoxFiles;
