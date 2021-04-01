import React, { useCallback } from 'react';
import routes from 'routes';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useHistory, generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isFunction from '@misakey/core/helpers/isFunction';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import processAutoInviteCryptoaction from '@misakey/react/crypto/store/actions/processAutoInviteCryptoaction';
import { markNotificationAsUsed } from 'store/actions/identity/notifications';

function ActualButton({ id, details: notifDetails, onClick }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { t } = useTranslation('common');

  const handleClick = useCallback(
    async (e) => {
      try {
        const notificationBoxId = await dispatch(
          processAutoInviteCryptoaction(notifDetails),
        );
        dispatch(markNotificationAsUsed(id));
        const { ownerOrgId } = notifDetails;
        if (isFunction(onClick)) {
          onClick(e);
        }
        history.push({
          pathname: generatePath(routes.boxes.read._, { id: notificationBoxId }),
          search: getNextSearch('', new Map([['orgId', ownerOrgId]])),
        });
      } catch (error) {
        logSentryException(error);
        enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'error' });
      }
    },
    [dispatch, notifDetails, id, onClick, history, enqueueSnackbar, t],
  );

  return (
    <Button
      onClick={handleClick}
      text={t('common:join')}
      standing={BUTTON_STANDINGS.TEXT}
    />
  );
}

ActualButton.propTypes = {
  details: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

ActualButton.defaultProps = {
  onClick: null,
};

const AutoInvitationButton = ({ notification: { id, details }, ...rest }) => (
  details.used ? null : ActualButton({ id, details, ...rest })
);

export default AutoInvitationButton;
