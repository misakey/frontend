import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useUploadContext } from '@misakey/ui/Input/Upload/Context';

import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItem: {
    justifyContent: 'center',
    padding: theme.spacing(1),
    '&:first-child': {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    '&:last-child': {
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
  },
}));

// COMPONENTS
function FooterMenuList({ t }) {
  const classes = useStyles();

  const { onOpen } = useUploadContext();

  return (
    <MenuList disablePadding autoFocusItem id="menu-list-actions">
      {/* <MenuItem className={classes.listItem} divider onClick={onClose}>
          <Typography>{t('boxes:read.actions.confirmIdentity')}</Typography>
        </MenuItem> */}
      <MenuItem className={classes.listItem} onClick={onOpen}>
        <Typography>{t('boxes:read.actions.upload')}</Typography>
      </MenuItem>
    </MenuList>
  );
}

FooterMenuList.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes'])(FooterMenuList);
