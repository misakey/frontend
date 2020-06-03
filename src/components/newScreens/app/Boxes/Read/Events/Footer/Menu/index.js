import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import BoxesSchema from 'store/schemas/Boxes';
import UploadDialog from 'components/smart/Dialog/Upload';

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

function FooterMenuActions({ box, t }) {
  const classes = useStyles();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);

  const onOpen = useCallback(() => {
    setIsUploadDialogOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setIsUploadDialogOpen(false);
  }, []);

  return (
    <>
      <UploadDialog
        request={box}
        open={isUploadDialogOpen}
        onSuccess={() => { /* update store */ }}
        onClose={onClose}
      />

      <MenuList disablePadding autoFocusItem id="menu-list-actions">
        {/* <MenuItem className={classes.listItem} divider onClick={onClose}>
          <Typography>{t('boxes:read.actions.confirmIdentity')}</Typography>
        </MenuItem> */}
        <MenuItem className={classes.listItem} onClick={onOpen}>
          <Typography>{t('boxes:read.actions.upload')}</Typography>
        </MenuItem>
      </MenuList>
    </>


  );
}

FooterMenuActions.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes'])(FooterMenuActions);
