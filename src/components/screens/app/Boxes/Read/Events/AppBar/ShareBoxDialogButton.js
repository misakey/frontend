import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import BoxesSchema from 'store/schemas/Boxes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { Link } from 'react-router-dom';

function ShareBoxDialogButton({ box, t }) {
  const { id } = useSafeDestr(box);

  const to = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  return (
    <Button
      component={Link}
      to={to}
      standing={BUTTON_STANDINGS.MAIN}
      text={t('common:share')}
    />
  );
}

ShareBoxDialogButton.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ShareBoxDialogButton);
