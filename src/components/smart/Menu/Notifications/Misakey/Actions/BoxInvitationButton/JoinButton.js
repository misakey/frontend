import React, { useCallback } from 'react';
import routes from 'routes';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import isFunction from '@misakey/core/helpers/isFunction';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import processAutoInviteCryptoaction from '@misakey/react/crypto/store/actions/processAutoInviteCryptoaction';
import { markNotificationAsUsed } from 'store/actions/identity/notifications';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

function JoinButton({ id, details: notifDetails, onClick }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const { t } = useTranslation('common');

  const handleClick = useCallback(
    async (e) => {
      try {
        const notificationBoxId = await dispatch(
          processAutoInviteCryptoaction(notifDetails),
        );
        dispatch(markNotificationAsUsed(id));
        if (isFunction(onClick)) {
          onClick(e);
        }
        history.push({
          pathname: generatePath(routes.boxes.read._, { id: notificationBoxId }),
        });
      } catch (error) {
        try {
          handleHttpErrors(error);
        } catch (_) {
          enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'warning' });
        }
      }
    },
    [dispatch, notifDetails, id, onClick, history, handleHttpErrors, enqueueSnackbar, t],
  );

  return (
    <Button
      onClick={handleClick}
      text={t('common:join')}
      standing={BUTTON_STANDINGS.TEXT}
    />
  );
}

JoinButton.propTypes = {
  details: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

JoinButton.defaultProps = {
  onClick: null,
};

export default JoinButton;
