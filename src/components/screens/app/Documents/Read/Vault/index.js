import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import FileListItem from 'components/smart/ListItem/File';
import ElevationScroll from 'components/dumb/ElevationScroll';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';

import Avatar from '@material-ui/core/Avatar';
import FolderIcon from '@material-ui/icons/Folder';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import withSavedFiles from 'components/smart/withSavedFiles';
import BoxEmpty from 'components/dumb/Box/Empty';
import SavedFilesSchema from 'store/schemas/Files/Saved';
import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.white,
  },
  content: {
    boxSizing: 'border-box',
    maxHeight: `calc(100% - ${APPBAR_HEIGHT}px)`,
    overflow: 'auto',
  },
}));

// COMPONENTS
const DocumentsVault = ({ t, isDrawerOpen, drawerWidth, toggleDrawer, savedFiles }) => {
  const [contentRef, setContentRef] = useState();
  const classes = useStyles();

  const isEmpty = useMemo(() => savedFiles.length === 0, [savedFiles.length]);

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer
          isDrawerOpen={isDrawerOpen}
          drawerWidth={drawerWidth}
        >
          <Box display="flex" flexDirection="column" width="100%">
            <Box display="flex">
              {!isDrawerOpen && (
                <Box display="flex" px={1}>
                  <IconButtonAppBar
                    aria-label={t('common:openAccountDrawer')}
                    edge="start"
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButtonAppBar>
                </Box>
              )}
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
      <Box p={2} ref={(ref) => setContentRef(ref)} className={classes.content}>
        <List>
          {savedFiles.map((file) => <FileListItem key={file.id} file={file} />)}
        </List>
      </Box>
    </>

  );
};

DocumentsVault.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  savedFiles: PropTypes.arrayOf(SavedFilesSchema.propTypes).isRequired,

  // withTranslation
  t: PropTypes.func.isRequired,
};


export default withTranslation(['common', 'document'])(withSavedFiles()(DocumentsVault));
