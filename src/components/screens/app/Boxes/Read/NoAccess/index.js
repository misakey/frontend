import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import makeStyles from '@material-ui/core/styles/makeStyles';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import CreateBoxSuggestions from 'components/smart/Box/CreateSuggestions';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import Divider from '@material-ui/core/Divider';
import Skeleton from '@material-ui/lab/Skeleton';
import BoxesSchema from 'store/schemas/Boxes';
import useFetchBoxPublicInfo from 'hooks/useFetchBoxPublicInfo';
import isNil from '@misakey/helpers/isNil';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { updateEntities } from '@misakey/store/actions/entities';

// HOOKS
const useStyles = makeStyles((theme) => ({
  icon: {
    height: '10rem',
    width: '10rem',
    color: theme.palette.grey[200],
    margin: theme.spacing(3),
  },
}));

// COMPONENTS


function NoAccess({ isDrawerOpen, toggleDrawer, box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { title, id } = useMemo(() => box, [box]);

  const onGetPublicInfo = useCallback(
    (response) => {
      dispatch(updateEntities([{ id, changes: response }], BoxesSchema));
    },
    [dispatch, id],
  );

  const onError = useCallback(
    () => {
      enqueueSnackbar(t('boxes:read.errors.incorrectLink'), { variant: 'warning' });
    },
    [enqueueSnackbar, t],
  );

  const getBoxPublicInfo = useFetchBoxPublicInfo(id, onGetPublicInfo);

  const { isFetching } = useFetchEffect(
    getBoxPublicInfo,
    { shouldFetch: isNil(title) },
    { onSuccess: onGetPublicInfo, onError },
  );

  return (
    <>
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
        p={6}
        display="flex"
        height="inherit"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          pb={6}
        >
          <RemoveCircleOutlineIcon className={classes.icon} color="primary" fontSize="large" />
          {isFetching && <Skeleton width="300" />}
          {!isNil(title) && <Title align="center">{t('boxes:read.noaccess.title', { title })}</Title>}
          {isNil(title) && !isFetching && <Title align="center">{t('boxes:read.noaccess.defaultTitle')}</Title>}
          <Subtitle>{t('boxes:read.noaccess.subtitle')}</Subtitle>
        </Box>

        <Box width="100%">
          <Divider variant="middle" />
        </Box>

        <CreateBoxSuggestions />
      </Box>
    </>

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
