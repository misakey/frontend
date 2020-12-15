import { useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import changeBoxInvitationLink from '@misakey/crypto/store/actions/changeBoxInvitationLink';

import isFunction from '@misakey/helpers/isFunction';

import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import DialogConfirm from '@misakey/ui/Dialog/Confirm';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

// COMPONENTS
const MenuItemBoxLinkRenew = ({ box, onClose }) => {
  const { t } = useTranslation('boxes');
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();

  const [open, setOpen] = useState(false);

  // in the near future,
  // action `changeBoxInvitationLink` will get the keys by itself from the store
  // (see action documentation)
  const { id: boxId, publicKey: boxPublicKey } = useSafeDestr(box);
  const boxSecretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(boxPublicKey),
    [publicKeysWeCanDecryptFrom, boxPublicKey],
  );

  const onConfirm = useCallback(
    async () => {
      dispatch(changeBoxInvitationLink({
        boxId,
        boxSecretKey,
        boxPublicKey,
      }));
    },
    [dispatch, boxId, boxSecretKey, boxPublicKey],
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
        button
        onClick={onClick}
        aria-label={t('boxes:renewLink.menu.primary')}
      >
        <Typography color="secondary">
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
};

MenuItemBoxLinkRenew.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onClose: PropTypes.func,
};

MenuItemBoxLinkRenew.defaultProps = {
  onClose: null,
};

export default MenuItemBoxLinkRenew;
