import PropTypes from 'prop-types';

import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';

import Box from '@material-ui/core/Box';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import isNil from '@misakey/helpers/isNil';

import usePaginateFileEventsByBox from 'hooks/usePaginateEventsByBox/Files';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useBoxesUploadContext } from 'components/smart/Input/Boxes/Upload/Context';
import { useTranslation } from 'react-i18next';
import { useState, useMemo, useRef } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ElevationScroll from 'components/dumb/ElevationScroll';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEmpty from 'components/dumb/Box/Empty';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import FabAdd from '@misakey/ui/Fab/Add';
import WindowedGridInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded/Grid';
import WindowedListAutoSized from 'components/smart/WindowedList/Autosized';
import FilePreviewCarouselContextProvider from 'components/smart/File/Preview/Carousel/Context';
import EventFilesCarousel from 'components/smart/Carousel/FilePreview/EventFiles';

import Cell, { Skeleton, CELL_HEIGHT } from './Cell';

// CONSTANTS
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

function BoxFiles({ belongsToCurrentUser, box }) {
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const contentRef = useRef();
  const { t } = useTranslation('boxes');

  const { onOpen: onOpenUploadDialog } = useBoxesUploadContext();

  const { id } = useMemo(() => box, [box]);

  const classes = useStyles({ headerHeight });

  const headerRef = (ref) => {
    if (ref) { setHeaderHeight(ref.clientHeight); }
  };

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const numColumns = isSmall ? 1 : NUM_COLUMNS;

  const {
    itemCount,
    loadMoreItems,
    byPagination,
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
    <FilePreviewCarouselContextProvider component={EventFilesCarousel} revokeOnChange={id}>
      <ElevationScroll target={contentRef.current}>
        <AppBarDrawer toolbarProps={{ px: 0 }} offsetHeight={headerHeight}>
          <Box ref={headerRef} display="flex" flexDirection="column" width="100%" minHeight="inherit">
            <Box display="flex">
              <ToggleDrawerButton />
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
              onClick={onOpenUploadDialog}
            />
          </>
        )}
      </Box>
    </FilePreviewCarouselContextProvider>
  );
}

BoxFiles.propTypes = {
  belongsToCurrentUser: PropTypes.bool.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default BoxFiles;
