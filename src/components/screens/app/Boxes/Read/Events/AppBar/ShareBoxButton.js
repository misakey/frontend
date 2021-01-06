import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';
import { LIMITED } from '@misakey/ui/constants/accessModes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import IconSharing from '@misakey/ui/Icon/Sharing';
import { Link } from 'react-router-dom';

function ShareBoxButton({ box, t }) {
  const { id, accessMode } = useSafeDestr(box);

  const to = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  const { isCurrentUserOwner } = useBoxReadContext();

  const iconSharingValue = useMemo(
    () => accessMode || LIMITED,
    [accessMode],
  );

  return (
    <Button
      component={Link}
      to={to}
      standing={BUTTON_STANDINGS.MAIN}
      text={isCurrentUserOwner ? (
        <>
          <IconSharing
            value={iconSharingValue}
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
