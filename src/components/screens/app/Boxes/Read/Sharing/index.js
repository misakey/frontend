import { useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import routes from 'routes';
import { ACCESS_RM, ACCESS_BULK } from 'constants/app/boxes/events';
import { LIMITED_RESTRICTION_TYPES } from 'constants/app/boxes/accesses';
import { IDENTIFIER } from '@misakey/ui/constants/accessTypes';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { updateAccessesEvents } from 'store/reducers/box';
import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';

import { getUpdatedAccesses, getEmailDomainAccesses, getRestrictions, sortRestrictionsByType } from 'helpers/accesses';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import differenceWith from '@misakey/helpers/differenceWith';
import { senderMatchesIdentifierValue, senderMatchesIdentityId, sendersMatch, identifierValuePath } from 'helpers/sender';
import { createBulkBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxShareMetadata from 'hooks/useBoxShareMetadata';
import useBoxAccesses from 'hooks/useBoxAccesses';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';

import { Link } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Avatar from '@material-ui/core/Avatar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import ListItemUserWhitelisted from '@misakey/ui/ListItem/User/Whitelisted';
import ListItemUserWhitelistedSkeleton from '@misakey/ui/ListItem/User/Whitelisted/Skeleton';
import ListItemUserWhitelistedMember from '@misakey/ui/ListItem/User/Whitelisted/Member';
import ListItemDomainWhitelisted from '@misakey/ui/ListItem/Domain/Whitelisted';

import ShareBoxForm from 'components/screens/app/Boxes/Read/Sharing/Form';
import ShareBoxFormSkeleton from 'components/screens/app/Boxes/Read/Sharing/Form/Skeleton';
import ListItemShareBoxLink from 'components/smart/ListItem/BoxLink/Share';

import ArrowBack from '@material-ui/icons/ArrowBack';
import PersonAddIcon from '@material-ui/icons/PersonAdd';

// CONSTANTS
const CONTENT_SPACING = 2;
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HELPERS
const pluckValue = pluck('value');

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    marginRight: theme.spacing(1),
  },
  listItemText: {
    margin: 0,
  },
  content: {
    boxSizing: 'border-box',
    maxHeight: `calc(100% - ${APPBAR_HEIGHT}px)`,
    overflow: 'auto',
  },
}));

// COMPONENTS
function ShareBoxDialog({ box, t }) {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();

  const [removeId, setRemoveId] = useState(null);

  const { id: boxId, accesses, members, creator } = useSafeDestr(box);

  const meIdentityId = useSelector(IDENTITY_ID_SELECTOR);
  const dispatch = useDispatch();

  /* FETCH ACCESSES */
  const { isFetching, isCurrentUserOwner } = useBoxAccesses(box);

  const isPrivate = useMemo(
    () => isEmpty(accesses) && isCurrentUserOwner,
    [accesses, isCurrentUserOwner],
  );

  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id: boxId });

  const whitelist = useMemo(
    () => {
      const restrictions = (accesses || []).map(({ id, content }) => ({ id, ...content }));
      return sortRestrictionsByType(restrictions
        .filter(({ restrictionType }) => LIMITED_RESTRICTION_TYPES
          .includes(restrictionType)));
    },
    [accesses],
  );

  const emailDomains = useMemo(
    () => (isEmpty(accesses) ? [] : pluckValue(getRestrictions(getEmailDomainAccesses(accesses)))),
    [accesses],
  );

  const membersNotInWhitelist = useMemo(
    () => {
      const membersWithoutCreator = (members || [])
        .filter((member) => !sendersMatch(member, creator));
      return differenceWith(
        membersWithoutCreator,
        whitelist,
        (member, { value }) => senderMatchesIdentifierValue(member, value),
      );
    },
    [members, whitelist, creator],
  );

  const { secretKey: boxSecretKey } = useBoxReadContext();

  const {
    invitationURL,
    boxKeyShare,
  } = useBoxShareMetadata(boxId);

  const onRemove = useCallback(
    async (event, referrerId, memberId) => {
      // if whitelist is going to be emptied, remove all accesses
      const events = whitelist.length > 1
        ? [{
          type: ACCESS_RM,
          referrerId,
        }]
        : accesses.map(({ id }) => ({
          type: ACCESS_RM,
          referrerId: id,
        }));
      const bulkEventsPayload = {
        batchType: ACCESS_BULK,
        events,
      };
      try {
        const response = await createBulkBoxEventBuilder(boxId, bulkEventsPayload);
        const newAccesses = getUpdatedAccesses(accesses, response);
        setRemoveId(memberId);
        await dispatch(updateAccessesEvents(boxId, newAccesses));
        enqueueSnackbar(t('boxes:read.share.update.success'), { variant: 'success' });
      } catch (err) {
        enqueueSnackbar(t('boxes:read.share.update.error'), { variant: 'warning' });
      }
    },
    [accesses, dispatch, boxId, whitelist, enqueueSnackbar, t],
  );

  useEffect(
    () => {
      if (!isNil(removeId)) {
        const memberToRemove = members.find(({ id: memberId }) => memberId === removeId);
        if (isNil(memberToRemove)) {
          setRemoveId(null);
        }
      }
    },
    [removeId, members],
  );

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer position="static" disableOffset>
          <IconButtonAppBar
            aria-label={t('common:goBack')}
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
          <ListItem disabled={!isCurrentUserOwner}>
            <ListItemAvatar>
              <Avatar className={classes.avatar}><PersonAddIcon fontSize="small" /></Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t('boxes:read.share.accesses.title')}
              primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
              className={classes.listItemText}
            />
          </ListItem>
          {(isFetching || (isNil(accesses) && isCurrentUserOwner)) ? (
            <ShareBoxFormSkeleton>
              <Box my={2}>
                <ListBordered disablePadding>
                  <ListItemUserWhitelistedSkeleton />
                </ListBordered>
              </Box>
              <ListItemShareBoxLink
                box={box}
                disabled={isPrivate}
                isOwner={isCurrentUserOwner}
              />
            </ShareBoxFormSkeleton>
          ) : (
            <ShareBoxForm
              accesses={accesses}
              boxId={boxId}
              invitationURL={invitationURL}
              isCurrentUserOwner={isCurrentUserOwner}
              membersNotInWhitelist={membersNotInWhitelist}
              isRemoving={!isNil(removeId)}
              boxKeyShare={boxKeyShare}
              boxSecretKey={boxSecretKey}
            >
              <Box my={2}>
                <ListBordered disablePadding>
                  <ListItemUserWhitelisted
                    key={creator.id}
                    isMe={senderMatchesIdentityId(creator, meIdentityId)}
                    isOwner
                    isMember
                    id={creator.id}
                    displayName={creator.displayName}
                    avatarUrl={creator.avatarUrl}
                    identifier={identifierValuePath(creator)}
                  />
                  {membersNotInWhitelist
                    .map((member) => (
                      <ListItemUserWhitelisted
                        key={member.id}
                        isMe={senderMatchesIdentityId(member, meIdentityId)}
                        isOwner={sendersMatch(member, creator)}
                        isMember
                        id={member.id}
                        displayName={member.displayName}
                        avatarUrl={member.avatarUrl}
                        identifier={identifierValuePath(member)}
                        emailDomains={emailDomains}
                      />
                    ))}
                  {whitelist.map((
                    { restrictionType, value, id, ...rest },
                  ) => (restrictionType === IDENTIFIER ? (
                    <ListItemUserWhitelistedMember
                      key={id}
                      id={id}
                      identifier={value}
                      members={members}
                      onRemove={onRemove}
                      emailDomains={emailDomains}
                      {...rest}
                    />
                  ) : (
                    <ListItemDomainWhitelisted
                      id={id}
                      key={id}
                      identifier={value}
                      {...rest}
                      onRemove={onRemove}
                    />
                  )))}
                </ListBordered>
              </Box>
              <ListItemShareBoxLink
                box={box}
                disabled={isPrivate}
                isOwner={isCurrentUserOwner}
              />
            </ShareBoxForm>
          )}
        </List>

      </Box>
    </>
  );
}

ShareBoxDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes', 'common'])(ShareBoxDialog);
