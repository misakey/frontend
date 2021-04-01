import React, { useState, useCallback, forwardRef } from 'react';

import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import changeBoxInvitationLink from '@misakey/react/crypto/store/actions/changeBoxInvitationLink';

import isFunction from '@misakey/core/helpers/isFunction';

import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

// COMPONENTS
const MenuItemBoxLinkRenew = forwardRef(({ box, onClose }, ref) => {
  const { t } = useTranslation('boxes');
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const { id: boxId, publicKey } = useSafeDestr(box);

  const onConfirm = useCallback(
    async () => {
      await dispatch(changeBoxInvitationLink({ boxId, publicKey }));
    },
    [dispatch, boxId, publicKey],
  );

  const onSuccess = useCallback(
    () => {
      enqueueSnackbar(t('boxes:renewLink.success'), { variant: 'success' });
    },
    [t, enqueueSnackbar],
  );

  const onDialogClose = useCallback(
    () => {
      setOpen(false);
      if (isFunction(onClose)) {
        onClose();
      }
    },
    [setOpen, onClose],
  );

  const onClick = useCallback(
    (event) => {
      setOpen(true);
      event.stopPropagation();
    },
    [setOpen],
  );

  return (
    <>
      <MenuItem
        ref={ref}
        button
        onClick={onClick}
        aria-label={t('boxes:renewLink.menu.primary')}
      >
        <Typography color="error">
          {t('boxes:renewLink.menu.primary')}
        </Typography>
      </MenuItem>
      <DialogConfirm
        isDialogOpen={open}
        onConfirm={onConfirm}
        onSuccess={onSuccess}
        onClose={onDialogClose}
        title={t('boxes:renewLink.dialog.title')}
        confirmButtonText={t('boxes:renewLink.dialog.primary')}
      >
        {t('boxes:renewLink.dialog.description')}
      </DialogConfirm>
    </>
  );
});

MenuItemBoxLinkRenew.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onClose: PropTypes.func,
};

MenuItemBoxLinkRenew.defaultProps = {
  onClose: null,
};

export default MenuItemBoxLinkRenew;
