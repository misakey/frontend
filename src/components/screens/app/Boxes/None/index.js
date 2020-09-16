import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

function BoxNone({ isDrawerOpen, toggleDrawer, t }) {
  useUpdateDocHead(t('boxes:documentTitle'));

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

BoxNone.propTypes = {
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxNone);
