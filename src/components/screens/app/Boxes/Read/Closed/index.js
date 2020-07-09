import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxAvatar from 'components/dumb/Avatar/Box';
import Title from '@misakey/ui/Typography/Title';
import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import BoxesSchema from 'store/schemas/Boxes';
import { DATE_FULL } from 'constants/formats/dates';

const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));

function BoxClosed({ drawerWidth, isDrawerOpen, toggleDrawer, box, t }) {
  const classes = useStyles();

  const { avatarUri, title = '', lastEvent } = useMemo(() => box, [box]);
  const { sender: { displayName }, serverEventCreatedAt } = useMemo(() => lastEvent, [lastEvent]);
  const date = useMemo(
    () => moment(serverEventCreatedAt).format(DATE_FULL), [serverEventCreatedAt],
  );

  return (
    <>
      <AppBarDrawer drawerWidth={drawerWidth}>
        {!isDrawerOpen && (
        <IconButtonAppBar
          color="inherit"
          aria-label={t('common:openAccountDrawer')}
          edge="start"
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButtonAppBar>
        )}
        <Box display="flex" flexGrow={1} overflow="hidden" alignItems="center">
          <Box display="flex" flexDirection="column">
            <Title gutterBottom={false} noWrap>
              {title}
            </Title>
          </Box>
        </Box>
        <BoxAvatar
          classes={{ root: classes.avatar }}
          src={avatarUri}
          title={title}
        />
      </AppBarDrawer>
      <Box
        px={6}
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Title align="center">{t('boxes:read.closed.info', { title, displayName, date })}</Title>
      </Box>
    </>

  );
}

BoxClosed.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxClosed);
