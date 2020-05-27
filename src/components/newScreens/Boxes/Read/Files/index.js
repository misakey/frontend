import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link, generatePath } from 'react-router-dom';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Title from 'components/dumb/Typography/Title';

function BoxFiles({ drawerWidth, box }) {
  const goBack = useMemo(() => generatePath(routes.boxes.read.details, { id: box.id }), [box.id]);

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
        <Title gutterBottom={false}>
          Box files !
        </Title>
      </AppBarDrawer>
      <Box p={2}>
        <Typography>La liste des fichiers</Typography>
      </Box>
    </>

  );
}

BoxFiles.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default BoxFiles;