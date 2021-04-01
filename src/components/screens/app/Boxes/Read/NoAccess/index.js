import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { LARGE } from '@misakey/ui/constants/sizes';
import { FOOTER_HEIGHT } from '@misakey/ui/Footer';
import BoxesSchema from 'store/schemas/Boxes';
import { receivePublicInfo } from 'store/reducers/box';
import authRoutes from '@misakey/react-auth/routes';

import isNil from '@misakey/core/helpers/isNil';

import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useFetchBoxPublicInfo from 'hooks/useFetchBoxPublicInfo';
import { useDispatch } from 'react-redux';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import CreateBoxSuggestions from 'components/smart/Box/CreateSuggestions';
import MuiLink from '@material-ui/core/Link';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Skeleton from '@material-ui/lab/Skeleton';
import AvatarBoxDenied from '@misakey/ui/Avatar/Box/Denied';
import AvatarBoxSkeleton from '@misakey/ui/Avatar/Box/Skeleton';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import Container from '@material-ui/core/Container';
import CardUserSignOut from '@misakey/react-auth/components/Card/User/SignOut';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    height: `calc(100% - ${FOOTER_HEIGHT}px)`,
  },
}));

// COMPONENTS
function NoAccess({ box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { title, id, creator } = useMemo(() => box, [box]);
  const { displayName: creatorName, id: creatorIdentityId } = useSafeDestr(creator);

  const linkProps = useMemo(
    () => (isNil(creatorIdentityId)
      ? {}
      : {
        component: Link,
        to: generatePath(authRoutes.identities.public, { id: creatorIdentityId }),
      }),
    [creatorIdentityId],
  );

  const onGetPublicInfo = useCallback(
    (response) => dispatch(receivePublicInfo(id, response)),
    [dispatch, id],
  );

  const onError = useCallback(
    () => {
      enqueueSnackbar(t('boxes:read.errors.invalid'), { variant: 'warning' });
    },
    [enqueueSnackbar, t],
  );

  const getBoxPublicInfo = useFetchBoxPublicInfo(id);

  const { isFetching } = useFetchEffect(
    getBoxPublicInfo,
    { shouldFetch: isNil(title) },
    { onSuccess: onGetPublicInfo, onError },
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="inherit"
    >
      <AppBarStatic toolbarProps={{ px: 0 }}>
        <Box display="flex" flexDirection="column" width="100%" minHeight="inherit">
          <Box display="flex">
            <BoxEventsAppBar disabled box={box} belongsToCurrentUser={belongsToCurrentUser} />
          </Box>
        </Box>
      </AppBarStatic>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
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
                <AvatarBoxDenied
                  title={title}
                  size={LARGE}
                />
              )}
              <Box mt={2}>
                {isFetching && <Skeleton width="300" />}
                {!isNil(title) && <Title align="left">{t('boxes:read.noaccess.title', { title })}</Title>}
                {isNil(title) && !isFetching && <Title align="left">{t('boxes:read.noaccess.defaultTitle')}</Title>}
                <Subtitle>
                  <Trans values={{ creatorName }} i18nKey="boxes:read.noaccess.subtitle">
                    {'Message '}
                    <MuiLink {...linkProps}>{'{{creatorName}}'}</MuiLink>
                    {' to request access'}
                  </Trans>
                </Subtitle>
              </Box>
            </Box>
          </Box>
          <CardUserSignOut
            mt={3}
            mb={6}
          />
          <Box width="100%">
            <Divider variant="middle" />
          </Box>

          <CreateBoxSuggestions />
        </Container>
        <FooterFullScreen />
      </Box>
    </Box>
  );
}

NoAccess.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
};

export default withTranslation(['boxes'])(NoAccess);
