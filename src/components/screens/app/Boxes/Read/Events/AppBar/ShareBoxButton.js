import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';

import { getRestrictionStatus } from 'helpers/accesses';

import useBoxAccesses from 'hooks/useBoxAccesses';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import IconSharing from '@misakey/ui/Icon/Sharing';
import { Link } from 'react-router-dom';

function ShareBoxButton({ box, t }) {
  const { id } = useSafeDestr(box);

  const to = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  /* FETCH ACCESSES */
  const { isFetching, isCurrentUserOwner } = useBoxAccesses(box);

  const restrictionStatus = useMemo(
    () => getRestrictionStatus(box),
    [box],
  );

  return (
    <Button
      component={Link}
      to={to}
      standing={BUTTON_STANDINGS.MAIN}
      isLoading={isFetching}
      text={isCurrentUserOwner ? (
        <>
          <IconSharing
            value={restrictionStatus}
          />
          {t('common:share')}
        </>
      ) : t('common:share')}
    />
  );
}

ShareBoxButton.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ShareBoxButton);
