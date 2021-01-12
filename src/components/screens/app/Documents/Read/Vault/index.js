import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';

import isNil from '@misakey/helpers/isNil';

import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import usePaginateSavedFiles from 'hooks/usePaginateSavedFiles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import BoxEmpty from 'components/dumb/Box/Empty';
import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';
import Avatar from '@material-ui/core/Avatar';
import FolderIcon from '@material-ui/icons/Folder';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import FabAdd from '@misakey/ui/Fab/Add';
import FilePreviewCarouselContextProvider from 'components/smart/File/Preview/Carousel/Context';
import SavedFilesCarousel from 'components/smart/Carousel/FilePreview/SavedFiles';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import VaultUploadDialog from 'components/smart/Dialog/Vault/Upload';
import WindowedGridInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded/Grid';
import WindowedListAutoSized from 'components/smart/WindowedList/Autosized';
import VaultCell, { Skeleton, CELL_HEIGHT } from './Cell';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.primary.main,
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
const DocumentsVault = () => {
  const ref = useRef();
  const classes = useStyles();
  const [isUploadDialogOpened, setIsUploadDialogOpened] = useState(false);
  const { t } = useTranslation('document');

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

  const itemData = useMemo(
    () => ({
      byPagination,
    }),
    [byPagination],
  );

  const loadedIndexes = useMemo(
    () => Object.keys(byPagination),
    [byPagination],
  );

  useUpdateDocHead(t('document:vault.title'));

  const onCloseDialog = useCallback(() => setIsUploadDialogOpened(false), []);
  const onOpenDialog = useCallback(() => setIsUploadDialogOpened(true), []);

  return (
    <>
      <ElevationScroll target={ref.current}>
        <AppBarDrawer>
          <Box display="flex" flexDirection="column" width="100%">
            <Box display="flex">
              <ToggleDrawerButton />

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
      <VaultUploadDialog open={isUploadDialogOpened} onClose={onCloseDialog} />
      {isEmpty && (
        <BoxEmpty py={0}>
          <Box display="flex" justifyContent="center" p={2}>
            <Button
              standing={BUTTON_STANDINGS.MAIN}
              text={t('document:vault.add')}
              onClick={onOpenDialog}
            />
          </Box>
        </BoxEmpty>
      )}
      {isLoading && <SplashScreen />}
      {!isEmpty && !isLoading && (
        <Box width="100%" className={classes.content}>
          <FilePreviewCarouselContextProvider component={SavedFilesCarousel}>
            <WindowedListAutoSized
              maxHeight="100%"
              component={WindowedGridInfiniteLoaded}
              numColumns={numColumns}
              loadMoreItems={loadMoreItems}
              loadedIndexes={loadedIndexes}
              Cell={VaultCell}
              Skeleton={Skeleton}
              itemCount={itemCount}
              itemData={itemData}
              rowHeight={CELL_HEIGHT}
              ref={ref}
              className={classes.list}
            />
            <FabAdd onClick={onOpenDialog} />
          </FilePreviewCarouselContextProvider>
        </Box>
      )}
    </>
  );
};

export default DocumentsVault;
