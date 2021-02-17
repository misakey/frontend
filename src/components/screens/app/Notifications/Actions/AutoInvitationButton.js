import React, { useCallback } from 'react';
import routes from 'routes';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import logSentryException from '@misakey/helpers/log/sentry/exception';
import getNextSearch from '@misakey/helpers/getNextSearch';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import processAutoInviteCryptoaction from '@misakey/crypto/store/actions/processAutoInviteCryptoaction';
import { markNotificationAsUsed } from 'store/actions/identity/notifications';

function ActualButton({ id, details: notifDetails }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation('common');

  const onClick = useCallback(
    async () => {
      try {
        const notificationBoxId = await dispatch(
          processAutoInviteCryptoaction(notifDetails),
        );
        dispatch(markNotificationAsUsed(id));
        const { ownerOrgId } = notifDetails;
        history.push({
          pathname: generatePath(routes.boxes.read._, { id: notificationBoxId }),
          search: getNextSearch('', new Map([['orgId', ownerOrgId]])),
        });
      } catch (error) {
        logSentryException(error);
        enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'error' });
      }
    },
    [dispatch, history, notifDetails, enqueueSnackbar, id, t],
  );

  return (
    <Button
      onClick={onClick}
      text={t('common:join')}
      standing={BUTTON_STANDINGS.TEXT}
    />
  );
}

ActualButton.propTypes = {
  details: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

const AutoInvitationButton = ({ notification: { id, details } }) => (
  details.used ? null : ActualButton({ id, details })
);

export default AutoInvitationButton;
