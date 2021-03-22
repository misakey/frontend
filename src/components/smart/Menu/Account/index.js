import React from 'react';
import PropTypes from 'prop-types';

import { MENU_FULLSCREEN, SMALL_MENU_WIDTH } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTranslation } from 'react-i18next';

import BoxAccount from 'components/smart/Box/Account';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

// HOOKS
const useStyles = makeStyles((theme) => ({
  menuPaper: () => ({
    width: SMALL_MENU_WIDTH,
    maxHeight: '100%',
    maxWidth: MENU_FULLSCREEN,
    [theme.breakpoints.down('sm')]: {
      width: MENU_FULLSCREEN,
      height: '100%',
    },
  }),
  menuList: {
    height: '100%',
    width: '100%',
    display: 'flex',
  },
}));

// COMPONENTS
const MenuAccount = ({ onClose, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation('common');
  return (
    <Menu
      classes={{
        paper: classes.menuPaper,
        list: classes.menuList,
      }}
      marginThreshold={0}
      onClose={onClose}
      MenuListProps={{
        disablePadding: true,
      }}
      {...props}
    >
      <BoxAccount onClose={onClose}>
        <IconButton
          edge="start"
          aria-label={t('common:close')}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </BoxAccount>
    </Menu>
  );
};

MenuAccount.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default MenuAccount;
