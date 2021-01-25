import React from 'react';
import { useTranslation } from 'react-i18next';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

function BoxNone() {
  const { t } = useTranslation(['common', 'boxes']);

  useUpdateDocHead(t('boxes:documentTitle'));

  const { isDrawerOpen, toggleDrawer } = useScreenDrawerContext();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: 'inherit' }}
    >
      <Title align="center">{t('boxes:list.select')}</Title>
      {!isDrawerOpen && (
        <Button text={t('common:select')} onClick={toggleDrawer} standing={BUTTON_STANDINGS.MAIN} />
      )}
    </Box>

  );
}

export default BoxNone;
