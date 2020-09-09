import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { withTranslation } from 'react-i18next';
import { normalize } from 'normalizr';

import BoxesSchema from 'store/schemas/Boxes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import useGetShareMethods from 'hooks/useGetShareMethods';
import CopyIcon from '@material-ui/icons/FilterNone';
import LinkIcon from '@material-ui/icons/Link';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextFieldStandard from '@misakey/ui/TextField/Standard';
import BoxControls from '@misakey/ui/Box/Controls';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import { getBoxAccessesBuilder } from '@misakey/helpers/builder/boxes';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import EventsSchema from 'store/schemas/Boxes/Events';

import ShareBoxForm, { AccessLevelFormSkeleton } from './Form';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    margin: theme.spacing(0, 0, 2, 0),
  },
  invitationURL: {
    width: '100%',
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  section: {
    padding: 12,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
  listItemText: {
    margin: 0,
  },
}));

function ShareBoxDialog({ box, t, open, onClose }) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const dispatch = useDispatch();

  const { id, publicKey, title, accesses } = useSafeDestr(box);
  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const isPrivate = useMemo(
    () => isEmpty(accesses) && belongsToCurrentUser,
    [accesses, belongsToCurrentUser],
  );

  const {
    canShare,
    invitationURL,
    onShare,
    onCopyLink,
  } = useGetShareMethods(id, title, publicKey, t);

  const shareAction = useMemo(
    () => (canShare ? onShare : onCopyLink),
    [canShare, onCopyLink, onShare],
  );

  /* FETCH ACCESSES */
  const onFetchAccesses = useCallback(
    () => getBoxAccessesBuilder(id),
    [id],
  );

  const shouldFetch = useMemo(
    () => isNil(accesses) && belongsToCurrentUser,
    [accesses, belongsToCurrentUser],
  );

  const onSuccess = useCallback(
    (response) => {
      const normalized = normalize(
        response,
        EventsSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id, changes: { accesses: result } }], BoxesSchema)),
      ]);
    },
    [dispatch, id],
  );

  const { isFetching } = useFetchEffect(
    onFetchAccesses,
    { shouldFetch },
    { onSuccess },
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="md"
    >
      <DialogTitleWithClose title={t('boxes:read.share.dialog.title')} onClose={onClose} />
      <DialogContent className={classes.dialogContentRoot}>
        {belongsToCurrentUser && (
          <Box className={classes.section}>
            <ListItem disableGutters dense>
              <ListItemAvatar>
                <Avatar className={classes.avatar}><PersonAddIcon fontSize="small" /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('boxes:read.share.dialog.accesses.title')}
                secondary={t('boxes:read.share.dialog.accesses.subtitle')}
                primaryTypographyProps={{ variant: 'h6' }}
                className={classes.listItemText}
              />
            </ListItem>
            {isFetching ? <AccessLevelFormSkeleton /> : (
              <ShareBoxForm
                isFetching={isFetching}
                accesses={accesses}
                boxId={id}
                invitationURL={invitationURL}
              />
            )}
          </Box>
        )}
        {!isPrivate && (
          <Box className={classes.section}>
            <ListItem disableGutters dense>
              <ListItemAvatar>
                <Avatar className={classes.avatar}><LinkIcon fontSize="small" /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('boxes:read.share.dialog.link.title')}
                secondary={t('boxes:read.share.dialog.link.subtitle')}
                primaryTypographyProps={{ variant: 'h6' }}
                className={classes.listItemText}
              />
            </ListItem>
            <Box display="flex" justifyContent="center" mb={1}>
              <TextFieldStandard
                name="invitationLink"
                prefix="boxes."
                value={invitationURL}
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t('common:share')}
                        onClick={shareAction}
                        edge="end"
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <BoxControls
              primary={{
                text: t('common:done'),
                onClick: onClose,
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

ShareBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  open: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation(['boxes', 'common'])(ShareBoxDialog);
