import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import { FOOTER_HEIGHT } from '@misakey/ui/Footer';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities } from '@misakey/store/actions/entities';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useFetchBoxPublicInfo from 'hooks/useFetchBoxPublicInfo';
import { useDispatch } from 'react-redux';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
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
import ChipUserMeLogout from '@misakey/ui/Chip/User/Me/Logout';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import Container from '@material-ui/core/Container';

import ArrowBack from '@material-ui/icons/ArrowBack';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    height: `calc(100% - ${FOOTER_HEIGHT}px)`,
  },
}));

// COMPONENTS
function NoAccess({ isDrawerOpen, toggleDrawer, box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { title, id, creator } = useMemo(() => box, [box]);
  const { displayName: creatorName, id: creatorIdentityId } = useSafeDestr(creator);

  const creatorProfileTo = useMemo(
    () => (isNil(creatorIdentityId)
      ? null
      : generatePath(routes.identities.public, { id: creatorIdentityId })),
    [creatorIdentityId],
  );

  const onGetPublicInfo = useCallback(
    (response) => {
      dispatch(updateEntities([{ id, changes: response }], BoxesSchema));
    },
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
      height="inherit"
    >
      <AppBarDrawer
        isDrawerOpen={isDrawerOpen}
        toolbarProps={{ px: 0 }}
        disableOffset
      >
        <Box display="flex" flexDirection="column" width="100%" minHeight="inherit">
          <Box display="flex">
            {!isDrawerOpen && (
              <Box display="flex" alignItems="center" pl={2} pr={1}>
                <IconButtonAppBar
                  aria-label={t('common:openAccountDrawer')}
                  edge="start"
                  onClick={toggleDrawer}
                >
                  <ArrowBack />
                </IconButtonAppBar>
              </Box>
            )}
            <BoxEventsAppBar disabled box={box} belongsToCurrentUser={belongsToCurrentUser} />
          </Box>
        </Box>
      </AppBarDrawer>
      <Box
        display="flex"
        flexDirection="column"
        flexGrow={1}
      >
        <Container
          className={classes.container}
          pt={8}
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
              mb={6}
            >
              {isFetching ? (<AvatarBoxSkeleton large />) : (
                <AvatarBoxDenied
                  title={title}
                  large
                />
              )}
              <Box mt={2}>
                {isFetching && <Skeleton width="300" />}
                {!isNil(title) && <Title align="left">{t('boxes:read.noaccess.title', { title })}</Title>}
                {isNil(title) && !isFetching && <Title align="left">{t('boxes:read.noaccess.defaultTitle')}</Title>}
                <Subtitle>
                  <Trans values={{ creatorName }} i18nKey="boxes:read.noaccess.subtitle">
                    {'Message '}
                    <MuiLink color="secondary" component={Link} to={creatorProfileTo}>{'{{creatorName}}'}</MuiLink>
                    {' to request access'}
                  </Trans>
                </Subtitle>
              </Box>
            </Box>
          </Box>
          <Box display="flex" justifyContent="center" mb={4} width="100%">
            <ChipUserMeLogout />
          </Box>
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
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'boxes'])(NoAccess);
