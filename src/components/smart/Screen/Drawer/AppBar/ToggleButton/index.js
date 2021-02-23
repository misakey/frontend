import React from 'react';

import { useTranslation } from 'react-i18next';
import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

import Box from '@material-ui/core/Box';
import ButtonDrawerDefault from 'components/smart/Button/Drawer/Default';

import ArrowBack from '@material-ui/icons/ArrowBack';

// COMPONENTS
function ToggleDrawerButton(props) {
  const { t } = useTranslation('common');
  const { isDrawerOpen } = useScreenDrawerContext();

  if (isDrawerOpen) { return null; }

  return (
    <Box display="flex" alignItems="center" pl={0} ml={-1} pr={1} {...props}>
      <ButtonDrawerDefault
        aria-label={t('common:openAccountDrawer')}
      >
        <ArrowBack />
      </ButtonDrawerDefault>
    </Box>
  );
}

export default ToggleDrawerButton;
