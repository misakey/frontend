import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

import BoxesSchema from 'store/schemas/Boxes';
import { DATE_FULL } from 'constants/formats/dates';
// import { CLOSED } from 'constants/app/boxes/statuses';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import { updateEntities } from '@misakey/store/actions/entities';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useBoxesContext } from 'components/smart/Context/Boxes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useFetchBoxPublicInfo from 'hooks/useFetchBoxPublicInfo';

import isNil from '@misakey/helpers/isNil';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
// import Alert from '@material-ui/lab/Alert';
import InfoIcon from '@material-ui/icons/Info';
// import LeaveBoxDialogButton from 'components/screens/app/Boxes/Read/Events/LeaveBoxDialogButton';
import Skeleton from '@material-ui/lab/Skeleton';
import CreateBoxSuggestions from 'components/smart/Box/CreateSuggestions';

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
function BoxClosed({ isDrawerOpen, toggleDrawer, box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { id, title = '', lastEvent, eventsCount } = useMemo(() => box, [box]);
  const { sender, serverEventCreatedAt: closedDate } = useSafeDestr(lastEvent);
  const { displayName } = useMemo(() => sender || {}, [sender]);

  const date = useMemo(
    () => (isNil(closedDate) ? null : moment(closedDate).format(DATE_FULL)),
    [closedDate],
  );

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

  const getBoxPublicInfo = useFetchBoxPublicInfo(id);

  const { isFetching } = useFetchEffect(
    getBoxPublicInfo,
    { shouldFetch: isNil(title) },
    { onSuccess: onGetPublicInfo, onError },
  );

  const shouldDisplayDefaultTitle = useMemo(
    () => isNil(title) && !isFetching,
    [isFetching, title],
  );

  const shouldDisplayDefaultSubtitle = useMemo(
    () => (isNil(displayName) || isNil(date) || isNil(title)) && !isFetching,
    [date, displayName, isFetching, title],
  );

  const { id: identityId } = useSelector(getCurrentUserSelector) || {};

  // const isClosed = useMemo(
  //   () => lifecycle === CLOSED,
  //   [lifecycle],
  // );

  // const displayLeaveBox = useMemo(
  //   () => !belongsToCurrentUser && isClosed,
  //   [belongsToCurrentUser, isClosed],
  // );

  // RESET BOX COUNT
  const { onAckWSUserBox } = useBoxesContext();

  const shouldFetch = useMemo(
    () => !isNil(id) && !isNil(identityId) && eventsCount > 0,
    [id, identityId, eventsCount],
  );

  const onResetBoxEventCount = useCallback(
    () => onAckWSUserBox(id),
    [onAckWSUserBox, id],
  );

  useFetchEffect(onResetBoxEventCount, { shouldFetch });

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
            <BoxEventsAppBar disabled box={box} belongsToCurrentUser={belongsToCurrentUser} />
          </Box>
          {/* {displayLeaveBox && (
          <Alert
            severity="info"
            action={<LeaveBoxDialogButton box={box} />}
          >
            {t('boxes:read.info.closed')}
          </Alert>
          )} */}
        </Box>
      </AppBarDrawer>
      <Box
        px={6}
        display="flex"
        flexDirection="column"
        height="inherit"
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
          <InfoIcon className={classes.icon} color="primary" fontSize="large" />
          {isFetching ? (
            <>
              <Skeleton width="300" />
              <Skeleton width="600" />
            </>
          ) : (
            <>
              <Title align="center">
                {shouldDisplayDefaultTitle
                  ? t('boxes:read.closed.defaultTitle')
                  : t('boxes:read.closed.title', { title })}
              </Title>
              <Subtitle>
                {shouldDisplayDefaultSubtitle
                  ? t('boxes:read.closed.defaultSubtitle')
                  : t('boxes:read.closed.subtitle', { title, displayName, date })}
              </Subtitle>
            </>
          )}
        </Box>

        <Box width="100%">
          <Divider variant="middle" />
        </Box>

        <CreateBoxSuggestions />
      </Box>
    </>

  );
}

BoxClosed.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxClosed);
