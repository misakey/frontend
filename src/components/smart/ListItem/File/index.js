import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';

import useFetchCallback from '@misakey/hooks/useFetch/callback';
import { makeStyles } from '@material-ui/core/styles/';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DialogFilePreview from 'components/smart/Dialog/FilePreview';

import { decryptFromVault } from '@misakey/crypto/vault';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import formatFileSize from 'helpers/formatFileSize';

import SavedFilesSchema from 'store/schemas/Files/Saved';
import { deleteSavedFile } from 'packages/helpers/src/builder/vault';
import { deleteSavedFiles } from 'store/reducers/savedFiles';
import { DATETIME_SHORT } from 'constants/formats/dates';
import useGetFileIconFromType from 'hooks/useGetFileIconFromType';


// HOOKS
const useStyles = makeStyles((theme) => ({
  paper: {
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  list: {
    padding: 0,
  },
  avatar: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.background.paper,
  },
}));

const FileListItem = ({ file, t }) => {
  const classes = useStyles();

  const vaultKey = useSelector(cryptoSelectors.getVaultKey);
  const identityId = useSelector(authSelectors.identityId);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isFilePreviewOpened, setIsFilePreviewOpened] = useState(false);

  const { encryptedMetadata, createdAt, id, encryptedFileId } = useMemo(() => file || {}, [file]);
  const { fileSize, fileName, fileType, encryption } = useMemo(
    () => decryptFromVault(encryptedMetadata, vaultKey),
    [encryptedMetadata, vaultKey],
  );

  const formattedSize = useMemo(
    () => formatFileSize(fileSize), [fileSize],
  );
  const formattedDate = useMemo(
    () => moment(createdAt).format(DATETIME_SHORT),
    [createdAt],
  );
  const secondary = useMemo(() => `${formattedDate} - ${formattedSize}`, [formattedDate, formattedSize]);

  const onClick = useCallback(
    (event) => { setAnchorEl(event.currentTarget); }, [],
  );

  const onClose = useCallback(
    () => { setAnchorEl(null); }, [],
  );

  const onCloseFilePreview = useCallback(
    () => { setIsFilePreviewOpened(false); }, [],
  );

  const onOpenFilePreview = useCallback(
    () => { setIsFilePreviewOpened(true); }, [],
  );

  const onDelete = useCallback(() => deleteSavedFile(id), [id]);

  const onDeleteSuccess = useCallback(() => {
    dispatch(deleteSavedFiles(identityId, [id]));
    onClose();
  }, [dispatch, id, identityId, onClose]);

  const { wrappedFetch: onRemove } = useFetchCallback(
    onDelete,
    { onSuccess: onDeleteSuccess },
  );

  const FileIcon = useGetFileIconFromType(fileType);

  return (
    <>
      <DialogFilePreview
        open={isFilePreviewOpened}
        encryptedFileId={encryptedFileId}
        encryption={encryption}
        fileSize={fileSize}
        fileName={fileName}
        fileType={fileType}
        onClose={onCloseFilePreview}
      />
      <ListItem button onClick={onOpenFilePreview} divider>
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <FileIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={fileName}
          secondary={secondary}
          primaryTypographyProps={{ noWrap: true, display: 'block', color: 'textPrimary' }}
          secondaryTypographyProps={{ noWrap: true, display: 'block' }}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={onClick} edge="end" aria-label="menu-more">
            <MoreVertIcon />
          </IconButton>
          <Menu
            id={`menu-delete-file-${id}`}
            anchorEl={anchorEl}
            keepMounted
            open={!isNil((anchorEl))}
            onClose={onClose}
            classes={{ paper: classes.paper, list: classes.list }}
            elevation={0}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={onRemove}>{t('common:delete')}</MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
};

FileListItem.propTypes = {
  file: PropTypes.shape(SavedFilesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};


export default withTranslation(['common'])(FileListItem);
