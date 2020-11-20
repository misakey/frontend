import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import sentryLogError from '@misakey/helpers/log/sentry';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import processAutoInviteCryptoaction from '@misakey/crypto/store/actions/processAutoInviteCryptoaction';

function ActualButton({ notifDetails }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation('common');

  const onClick = useCallback(
    async () => {
      try {
        const { boxUrl } = await dispatch(
          processAutoInviteCryptoaction(notifDetails),
        );
        history.push(boxUrl);
      } catch (error) {
        sentryLogError(error);
        enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'error' });
      }
    },
    [dispatch, history, notifDetails, enqueueSnackbar, t],
  );

  return (
    <Button
      onClick={onClick}
      text={t('common:join')}
      standing={BUTTON_STANDINGS.OUTLINED}
    />
  );
}

ActualButton.propTypes = {
  notifDetails: PropTypes.object.isRequired,
};

const AutoInvitationButton = ({ notifDetails }) => (
  notifDetails.used ? null : ActualButton({ notifDetails })
);

export default AutoInvitationButton;
