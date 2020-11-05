import React, { useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import useTheme from '@material-ui/core/styles/useTheme';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ToggleDrawerButton from 'components/dumb/AppBar/Drawer/ToggleButton';

import Avatar from '@material-ui/core/Avatar';
import FolderIcon from '@material-ui/icons/Folder';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BoxEmpty from 'components/dumb/Box/Empty';
import makeStyles from '@material-ui/core/styles/makeStyles';
import isNil from '@misakey/helpers/isNil';

import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import FilePreviewContextProvider from 'components/smart/File/Preview/Context';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

import WindowedGridInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded/Grid';
import WindowedListAutoSized from 'components/smart/WindowedList/Autosized';
import usePaginateSavedFiles from 'hooks/usePaginateSavedFiles';
import VaultCell, { Skeleton, CELL_HEIGHT } from './Cell';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  content: {
    boxSizing: 'border-box',
    height: `calc(100% - ${APPBAR_HEIGHT}px)`,
    overflow: 'auto',
  },
  list: {
    overflowX: 'hidden !important',
  },
}));

const NUM_COLUMNS = 2;

// COMPONENTS
const DocumentsVault = ({ t, isDrawerOpen, toggleDrawer }) => {
  const ref = useRef();
  const classes = useStyles();

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const numColumns = isSmall ? 1 : NUM_COLUMNS;

  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateSavedFiles();

  const isEmpty = useMemo(() => itemCount === 0, [itemCount]);
  const isLoading = useMemo(() => isNil(itemCount), [itemCount]);
  const itemData = useMemo(() => ({ byPagination }), [byPagination]);

  useUpdateDocHead(t('document:vault.title'));

  return (
    <>
      <ElevationScroll target={ref.current}>
        <AppBarDrawer
          isDrawerOpen={isDrawerOpen}
        >
          <Box display="flex" flexDirection="column" width="100%">
            <Box display="flex">
              <ToggleDrawerButton isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />

              <Box display="flex" flexDirection="column" flexGrow={1}>
                <Typography color="textPrimary">
                  {t('document:vault.title')}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t('document:vault.subtitle')}
                </Typography>
              </Box>
              <Avatar className={classes.avatar}>
                <FolderIcon />
              </Avatar>
            </Box>

          </Box>
        </AppBarDrawer>
      </ElevationScroll>
      {isEmpty && <BoxEmpty py={0} />}
      {isLoading && <SplashScreen />}
      {!isEmpty && !isLoading && (
        <Box width="100%" className={classes.content}>
          <FilePreviewContextProvider>
            <WindowedListAutoSized
              maxHeight="100%"
              component={WindowedGridInfiniteLoaded}
              numColumns={numColumns}
              loadMoreItems={loadMoreItems}
              Cell={VaultCell}
              Skeleton={Skeleton}
              itemCount={itemCount}
              itemData={itemData}
              rowHeight={CELL_HEIGHT}
              ref={ref}
              className={classes.list}
            />
          </FilePreviewContextProvider>
        </Box>
      )}
    </>
  );
};

DocumentsVault.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,

  // withTranslation
  t: PropTypes.func.isRequired,
};


export default withTranslation(['document'])(DocumentsVault);
