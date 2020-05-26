import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import routes from 'routes';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import Avatar from '@material-ui/core/Avatar';
import Title from 'components/dumb/Typography/Title';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));

function BoxEvents({ drawerWidth, isDrawerOpen, toggleDrawer, box }) {
  const classes = useStyles();
  const routeDetails = useMemo(
    () => generatePath(routes.boxes.read.details, { id: box.id }),
    [box.id],
  );

  return (
    <>
      <AppBarDrawer drawerWidth={drawerWidth}>
        {!isDrawerOpen && (
          <IconButtonAppBar
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButtonAppBar>
        )}
        <Title className={classes.title} gutterBottom={false}>
          Box view
        </Title>
        <IconButtonAppBar
          aria-label="box-details"
          aria-controls="menu-appbar"
          component={Link}
          to={routeDetails}
          edge="end"
        >
          <Avatar classes={{ root: classes.avatar }}>B</Avatar>
        </IconButtonAppBar>
      </AppBarDrawer>
      <Box p={2}>
        <Typography>
          Events of
          {' '}
          {box.id}
        </Typography>
      </Box>
    </>

  );
}

BoxEvents.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default BoxEvents;
