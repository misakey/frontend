import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import routes from 'routes';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { Link } from 'react-router-dom';
import ButtonShortcut from '@misakey/ui/Button/Shortcut';

import PersonAddIcon from '@material-ui/icons/PersonAdd';

// COMPONENTS
const IconButtonBoxesShare = forwardRef(({ box, ...rest }, ref) => {
  const { id } = useSafeDestr(box);
  const { t } = useTranslation('common');

  const label = useMemo(
    () => t('common:share'),
    [t],
  );

  const to = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  return (
    <ButtonShortcut
      ref={ref}
      component={Link}
      to={to}
      label={label}
      {...rest}
    >
      <PersonAddIcon color="action" />
    </ButtonShortcut>
  );
});

IconButtonBoxesShare.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesShare;
