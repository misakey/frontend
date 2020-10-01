import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { normalize } from 'normalizr';

import BoxesSchema from 'store/schemas/Boxes';
import EventsSchema from 'store/schemas/Boxes/Events';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import routes from 'routes';

import { getBoxAccessesBuilder } from '@misakey/helpers/builder/boxes';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useDispatch } from 'react-redux';
import useGetShareMethods from 'hooks/useGetShareMethods';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Avatar from '@material-ui/core/Avatar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';

import CopyIcon from '@material-ui/icons/FilterNone';
import LinkIcon from '@material-ui/icons/Link';
import ArrowBack from '@material-ui/icons/ArrowBack';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ShareBoxForm, { AccessLevelFormSkeleton } from './Form';

// CONSTANTS
const CONTENT_SPACING = 2;

// HOOKS
const useStyles = makeStyles((theme) => ({

  invitationURL: {
    width: '100%',
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
  section: {
    padding: 12,
    marginBottom: theme.spacing(2),
  },
  listItemText: {
    margin: 0,
  },
}));

function ShareBoxDialog({ box, isDrawerOpen, t }) {
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const dispatch = useDispatch();

  const { id, publicKey, title, accesses } = useSafeDestr(box);
  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const isPrivate = useMemo(
    () => isEmpty(accesses) && belongsToCurrentUser,
    [accesses, belongsToCurrentUser],
  );

  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id });

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
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer position="static" disableOffset isDrawerOpen={isDrawerOpen}>
          <IconButtonAppBar
            aria-label={t('common:openAccountDrawer')}
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
          <BoxFlexFill />
          <Button
            text={t('common:done')}
            component={Link}
            to={goBack}
            standing={BUTTON_STANDINGS.MAIN}
          />

        </AppBarDrawer>
      </ElevationScroll>
      <Box p={CONTENT_SPACING} pt={0} ref={(ref) => setContentRef(ref)} className={classes.content}>
        <List disablePadding>
          <ListItem
            aria-label={t('common:share')}
            onClick={shareAction}
            disabled={isPrivate}
            button
          >
            <ListItemAvatar>
              <Avatar className={classes.avatar}><LinkIcon fontSize="small" /></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t('boxes:read.share.dialog.link.title')}
              primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
              className={classes.listItemText}
            />
            <CopyIcon fontSize="small" color="action" />
          </ListItem>
          {belongsToCurrentUser && (
            <>
              <ListItem>
                <ListItemAvatar>
                  <Avatar className={classes.avatar}><PersonAddIcon fontSize="small" /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={t('boxes:read.share.dialog.accesses.title')}
                  secondary={t('boxes:read.share.dialog.accesses.subtitle')}
                  primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
                  className={classes.listItemText}
                />
              </ListItem>
              <Box className={classes.section}>
                {isFetching || isNil(accesses) ? <AccessLevelFormSkeleton /> : (
                  <ShareBoxForm
                    isFetching={isFetching}
                    accesses={accesses}
                    boxId={id}
                    invitationURL={invitationURL}
                  />
                )}
              </Box>
            </>
          )}
        </List>
      </Box>
    </>
  );
}

ShareBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
};

export default withTranslation(['boxes', 'common'])(ShareBoxDialog);
