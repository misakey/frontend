import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router-dom';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import useFetchCallback from '@misakey/hooks/useFetch/callback';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ChipUser from '@misakey/ui/Chip/User';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import BoxesSchema from 'store/schemas/Boxes';
import PasteLinkScreen from 'components/screens/app/Boxes/Read/PasteLink';
import useFetchBoxPublicInfo from 'hooks/useFetchBoxPublicInfo';
import { getBoxBuilder, createBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import isNil from '@misakey/helpers/isNil';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import BoxControls from '@misakey/ui/Box/Controls';
import { updateEntities } from '@misakey/store/actions/entities';
import { MEMBER_JOIN } from 'constants/app/boxes/events';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import { useBoxesContext } from 'components/smart/Context/Boxes';
import { getCode, getDetails } from '@misakey/helpers/apiError';
import errorTypes from '@misakey/ui/constants/errorTypes';


const { forbidden } = errorTypes;
const NO_ACCESS = 'no_access';

// COMPONENTS
function MustJoin({ isDrawerOpen, toggleDrawer, box, t }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const { addBoxItem } = useBoxesContext();
  const [shouldShowPasteScreen, setShouldShowPasteScreen] = useState(false);

  const { title, id } = useMemo(() => box, [box]);

  const currentUser = useSelector(getCurrentUserSelector);
  const { displayName, avatarUrl } = useSafeDestr(currentUser);

  const onDelete = useCallback(() => history.replace(routes.boxes._), [history]);

  const onGetPublicInfo = useCallback(
    (response) => {
      dispatch(updateEntities([{ id, changes: response }], BoxesSchema));
    },
    [dispatch, id],
  );

  const onPublicInfoError = useCallback(
    () => {
      setShouldShowPasteScreen(true);
      enqueueSnackbar(t('boxes:read.errors.incorrectLink'), { variant: 'warning' });
    },
    [enqueueSnackbar, t],
  );

  const getBoxPublicInfo = useFetchBoxPublicInfo(id, onGetPublicInfo);

  const { isFetching } = useFetchEffect(
    getBoxPublicInfo,
    { shouldFetch: isNil(title) },
    { onSuccess: onGetPublicInfo, onError: onPublicInfoError },
  );

  const onSuccess = useCallback(
    (response) => addBoxItem({ ...response, isMember: true }),
    [addBoxItem],
  );

  const getBox = useCallback(
    () => getBoxBuilder(id),
    [id],
  );


  const onError = useCallback(
    async (error) => {
      const code = getCode(error);
      const { reason } = getDetails(error);
      if (code === forbidden && reason === NO_ACCESS) {
        dispatch(updateEntities([{ id, changes: { hasAccess: false } }], BoxesSchema));
      } else {
        handleHttpErrors(error);
      }
    },
    [dispatch, handleHttpErrors, id],
  );

  const { wrappedFetch: onFetchBox, isFetching: isFetchingBox } = useFetchCallback(
    getBox,
    { onSuccess },
  );

  const createJoinEvent = useCallback(
    () => createBoxEventBuilder(id, { type: MEMBER_JOIN }),
    [id],
  );

  const { wrappedFetch: onJoin, isFetching: isJoining } = useFetchCallback(
    createJoinEvent,
    { onSuccess: onFetchBox, onError },
  );

  if (isFetchingBox || isJoining) {
    return <SplashScreen />;
  }

  if (shouldShowPasteScreen) {
    return (
      <PasteLinkScreen
        box={box}
        isDrawerOpen={isDrawerOpen}
      />
    );
  }

  return (
    <>
      <AppBarDrawer
        isDrawerOpen={isDrawerOpen}
        toolbarProps={{ px: 0 }}
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
          </Box>
        </Box>
      </AppBarDrawer>
      <Box
        p={8}
        display="flex"
        height="inherit"
        flexDirection="column"
      >
        {isFetching && <Skeleton width="300" />}
        {!isNil(title) && <Title align="left">{t('boxes:read.mustjoin.title', { title })}</Title>}
        {isNil(title) && !isFetching && <Title align="left">{t('boxes:read.mustjoin.defaultTitle')}</Title>}
        <Subtitle>{t('boxes:read.mustjoin.subtitle')}</Subtitle>
        <Box alignSelf="center" my={2}>
          <ChipUser
            displayName={displayName}
            avatarUrl={avatarUrl}
            onDelete={onDelete}
          />
        </Box>
        <BoxControls primary={{ onClick: onJoin, text: t('boxes:read.mustjoin.button') }} />
      </Box>
    </>

  );
}

MustJoin.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(MustJoin);
