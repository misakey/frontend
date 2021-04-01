import React, { useMemo, useCallback, useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { useLocation, Link, generatePath } from 'react-router-dom';

import authRoutes from '@misakey/react/auth/routes';
import { updateEntities } from '@misakey/store/actions/entities';
import { MEMBER_JOIN } from '@misakey/core/api/constants/boxes/events';
import { forbidden } from '@misakey/core/api/constants/errorTypes';
import BoxesSchema from 'store/schemas/Boxes';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { receivePublicInfo } from 'store/reducers/box';
import { FOOTER_HEIGHT } from '@misakey/ui/Footer';
import { LARGE } from '@misakey/ui/constants/sizes';

import { createBoxEventBuilder } from '@misakey/core/api/helpers/builder/boxes';
import isNil from '@misakey/core/helpers/isNil';
import { getCode, getDetails } from '@misakey/core/helpers/apiError';

import { useSelector, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useFetchBoxPublicInfo from 'hooks/useFetchBoxPublicInfo';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import usePropChanged from '@misakey/hooks/usePropChanged';
import makeStyles from '@material-ui/core/styles/makeStyles';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import Title from '@misakey/ui/Typography/Title';
import MuiLink from '@material-ui/core/Link';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import Container from '@material-ui/core/Container';
import ListItemIdentifier from '@misakey/ui/ListItem/Identifier';
import List from '@material-ui/core/List';
import CardUserSignOut from '@misakey/react/auth/components/Card/User/SignOut';
import BoxControls from '@misakey/ui/Box/Controls';
import AvatarBox from '@misakey/ui/Avatar/Box';
import AvatarBoxSkeleton from '@misakey/ui/Avatar/Box/Skeleton';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';

// CONSTANTS
const NO_ACCESS = 'no_access';
const { identity: IDENTITY_SELECTOR } = authSelectors;

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    height: `calc(100% - ${FOOTER_HEIGHT}px)`,
  },
}));

// COMPONENTS
function MustJoin({ box, t }) {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { hash } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const [shouldShowPasteScreen, setShouldShowPasteScreen] = useState(false);

  const { title, id, hasAccess, creator } = useMemo(() => box, [box]);
  const { displayName: creatorName, id: creatorIdentityId } = useSafeDestr(creator);

  const identity = useSelector(IDENTITY_SELECTOR);
  const { identifierValue } = useSafeDestr(identity);

  const creatorProfileTo = useMemo(
    () => (isNil(creatorIdentityId)
      ? null
      : generatePath(authRoutes.identities.public, { id: creatorIdentityId })),
    [creatorIdentityId],
  );

  const [hashChanged, resetHashChanged] = usePropChanged(hash);

  const onGetPublicInfo = useCallback(
    (response) => dispatch(receivePublicInfo(id, response)),
    [dispatch, id],
  );

  const onPublicInfoError = useCallback(
    () => {
      setShouldShowPasteScreen(true);
      enqueueSnackbar(t('boxes:read.errors.invalid'), { variant: 'warning' });
    },
    [enqueueSnackbar, t],
  );

  const getBoxPublicInfo = useFetchBoxPublicInfo(id);

  const shouldFetch = useMemo(
    () => hasAccess !== false && (hashChanged || isNil(title)) && !shouldShowPasteScreen,
    [hasAccess, hashChanged, shouldShowPasteScreen, title],
  );

  const { isFetching } = useFetchEffect(
    getBoxPublicInfo,
    { shouldFetch, stopOnError: false },
    { onSuccess: onGetPublicInfo, onError: onPublicInfoError, onFinally: resetHashChanged },
  );

  const onError = useCallback(
    async (error) => {
      const code = getCode(error);
      const { reason } = getDetails(error);
      if (code === forbidden) {
        if (reason === NO_ACCESS) {
          dispatch(updateEntities([{ id, changes: { hasAccess: false } }], BoxesSchema));
          return;
        }
      }
      handleHttpErrors(error);
    },
    [dispatch, handleHttpErrors, id],
  );

  const createJoinEvent = useCallback(
    () => createBoxEventBuilder(id, { type: MEMBER_JOIN }),
    [id],
  );

  const { wrappedFetch: onJoin, isFetching: isJoining } = useFetchCallback(
    createJoinEvent,
    { onError },
  );

  useEffect(
    () => {
      setShouldShowPasteScreen(false);
    },
    [hash],
  );

  if (isJoining) {
    return <SplashScreen />;
  }

  if (shouldShowPasteScreen) {
    return (
      <PasteLinkScreen box={box} />
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="inherit"
    >
      <AppBarStatic toolbarProps={{ px: 0 }}>
        <Box display="flex" flexDirection="column" width="100%" minHeight="inherit">
          <Box display="flex">
            <BoxEventsAppBar disabled box={box} belongsToCurrentUser={false} />
          </Box>
        </Box>
      </AppBarStatic>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
        width="100%"
      >
        <Container
          className={classes.container}
          pt={2}
          maxWidth="md"
          component={Box}
          overflow="auto"
        >
          <Box
            width="100%"
            display="flex"
            justifyContent="center"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              width="100%"
            >
              {isFetching ? (<AvatarBoxSkeleton size={LARGE} />) : (
                <AvatarBox
                  title={title}
                  size={LARGE}
                />
              )}
              <Box mt={2} width="100%">
                {isFetching && <Skeleton width="300" />}
                {!isNil(title) && <Title align="left" gutterBottom={false}>{t('common:connect.title', { resourceName: title })}</Title>}
                {isNil(title) && !isFetching && <Title align="left" gutterBottom={false}>{t('boxes:read.mustjoin.defaultTitle')}</Title>}
                <Subtitle>
                  {isNil(creatorProfileTo)
                    ? <Skeleton width={300} />
                    : <TransRequireAccess querier={creatorName} to={creatorProfileTo} />}
                </Subtitle>
                <CardUserSignOut
                  disablePadding
                  mt={3}
                  mb={2}
                >
                  <List disablePadding>
                    <ListItemIdentifier dense identifier={identifierValue} />
                  </List>
                </CardUserSignOut>
                <Subtitle>
                  {isNil(creatorProfileTo)
                    ? <Skeleton width={400} />
                    : (
                      <Trans values={{ creatorName }} i18nKey="common:connect.authorize">
                        {'Authorize '}
                        <MuiLink component={Link} to={creatorProfileTo}>{'{{creatorName}}'}</MuiLink>
                        {' to access above information ?'}
                      </Trans>
                    )}
                </Subtitle>
                <BoxControls
                  mt={2}
                  primary={{
                    onClick: onJoin,
                    text: t('common:connect.action'),
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
        <FooterFullScreen />
      </Box>
    </Box>
  );
}

MustJoin.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(MustJoin);
