import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import IconButtonAppBar from 'components/dumb/IconButton/Appbar';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';

// COMPONENTS
function ToggleDrawerButton({ toggleDrawer, isDrawerOpen }) {
  const { t } = useTranslation('common');

  if (isDrawerOpen) { return null; }

  return (
    <Box display="flex" alignItems="center" pl={2} pr={1}>
      <IconButtonAppBar
        aria-label={t('common:openAccountDrawer')}
        edge="start"
        onClick={toggleDrawer}
      >
        <ArrowBack />
      </IconButtonAppBar>
    </Box>
  );
}

ToggleDrawerButton.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default ToggleDrawerButton;
