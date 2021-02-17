import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

import Box from '@material-ui/core/Box';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';

import ArrowBack from '@material-ui/icons/ArrowBack';

// COMPONENTS
function ToggleDrawerButton(props) {
  const { t } = useTranslation('common');
  const { toggleDrawer, isDrawerOpen } = useScreenDrawerContext();

  const onClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleDrawer();
    },
    [toggleDrawer],
  );

  if (isDrawerOpen) { return null; }

  return (
    <Box display="flex" alignItems="center" pl={0} ml={-1} pr={1} {...props}>
      <IconButtonAppBar
        aria-label={t('common:openAccountDrawer')}
        edge="start"
        onClick={onClick}
      >
        <ArrowBack />
      </IconButtonAppBar>
    </Box>
  );
}

export default ToggleDrawerButton;
