import React, { useCallback } from 'react';
import routes from 'routes';

import PropTypes from 'prop-types';
import { useHistory, generatePath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import getNextSearch from '@misakey/core/helpers/getNextSearch';
import isFunction from '@misakey/core/helpers/isFunction';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const SeeButton = ({ details: notifDetails, onClick }) => {
  const history = useHistory();

  const { t } = useTranslation('common');

  const { boxId, ownerOrgId } = useSafeDestr(notifDetails);

  const handleClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        onClick(e);
      }
      history.push({
        pathname: generatePath(routes.boxes.read._, { id: boxId }),
        search: getNextSearch('', new Map([['orgId', ownerOrgId]])),
      });
    },
    [onClick, history, boxId, ownerOrgId],
  );

  return (
    <Button
      onClick={handleClick}
      text={t('common:see')}
      standing={BUTTON_STANDINGS.TEXT}
    />
  );
};

SeeButton.propTypes = {
  details: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

SeeButton.defaultProps = {
  onClick: null,
};

export default SeeButton;
