import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link, generatePath } from 'react-router-dom';

import Button from '@misakey/ui/Button';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';

function BoxDetails({ drawerWidth, box }) {
  const goBack = useMemo(() => generatePath(routes.boxes.read._, { id: box.id }), [box.id]);
  const routeFiles = useMemo(() => generatePath(routes.boxes.read.files, { id: box.id }), [box.id]);

  return (
    <>
      <AppBarDrawer drawerWidth={drawerWidth}>
        <IconButtonAppBar
          color="inherit"
          aria-label="open drawer"
          edge="start"
          component={Link}
          to={goBack}
        >
          <ArrowBack />
        </IconButtonAppBar>
        <Typography variant="h6" noWrap>
          Box details !
        </Typography>
      </AppBarDrawer>
      <Box p={2}>
        <Typography>Les détails de la box</Typography>
        <Button component={Link} to={routeFiles} text="Voir les fichiers" />
      </Box>
    </>

  );
}

BoxDetails.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default BoxDetails;
