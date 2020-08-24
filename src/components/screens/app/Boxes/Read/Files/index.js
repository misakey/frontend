import React from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link } from 'react-router-dom';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Title from '@misakey/ui/Typography/Title';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { withTranslation } from 'react-i18next';

function BoxFiles({ drawerWidth, isDrawerOpen, box, t }) {
  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read.details, { id: box.id });

  return (
    <>
      <AppBarDrawer drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
        <IconButtonAppBar
          aria-label={t('common:openAccountDrawer')}
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
  t: PropTypes.func.isRequired,
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default withTranslation('common')(BoxFiles);
