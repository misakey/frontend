import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

// import { CLOSED } from 'constants/app/boxes/statuses';

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
import CreateBoxSuggestions from 'components/smart/Box/CreateSuggestions';
import { makeStyles } from '@material-ui/core/styles';

import BoxesSchema from 'store/schemas/Boxes';
import { DATE_FULL } from 'constants/formats/dates';

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
  const { title = '', lastEvent } = useMemo(() => box, [box]);
  const { sender: { displayName }, serverEventCreatedAt } = useMemo(() => lastEvent, [lastEvent]);
  const date = useMemo(
    () => moment(serverEventCreatedAt).format(DATE_FULL), [serverEventCreatedAt],
  );

  // const isClosed = useMemo(
  //   () => lifecycle === CLOSED,
  //   [lifecycle],
  // );

  // const displayLeaveBox = useMemo(
  //   () => !belongsToCurrentUser && isClosed,
  //   [belongsToCurrentUser, isClosed],
  // );

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
          <Title align="center">{t('boxes:read.closed.title', { title })}</Title>
          <Subtitle>{t('boxes:read.closed.subtitle', { title, displayName, date })}</Subtitle>
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
