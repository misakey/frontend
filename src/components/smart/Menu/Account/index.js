import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';
import BoxAccount from 'components/smart/Box/Account';
import MenuFullScreen from '@misakey/ui/Menu/FullScreen';
import IconButton from '@material-ui/core/IconButton';
import ListWorkspaces from 'components/smart/List/Workspaces';

import CloseIcon from '@material-ui/icons/Close';

// COMPONENTS
const MenuAccount = ({ onClose, ...props }) => {
  const { t } = useTranslation('common');
  return (
    <MenuFullScreen
      onClose={onClose}
      {...props}
    >
      <BoxAccount
        actions={(
          <IconButton
            edge="start"
            aria-label={t('common:close')}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
      )}
        onClose={onClose}
      >
        <Box mx={2}>
          <ListWorkspaces />
        </Box>
      </BoxAccount>
    </MenuFullScreen>
  );
};

MenuAccount.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MenuAccount;
