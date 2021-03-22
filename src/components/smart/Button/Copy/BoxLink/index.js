import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import BoxSchema from 'store/schemas/Boxes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGetShareMethods from 'hooks/useGetShareMethods';
import { useTranslation } from 'react-i18next';

import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';

// COMPONENTS
const ButtonCopyBoxLink = forwardRef(({ box, ...props }, ref) => {
  const { t } = useTranslation('common');

  const { id, title } = useSafeDestr(box);

  const {
    shareDetails,
  } = useGetShareMethods(id, title);

  return (
    <ButtonCopy
      ref={ref}
      value={shareDetails.url}
      message={t('common:copyInvitationLink')}
      mode={MODE.both}
      {...props}
    />
  );
});

ButtonCopyBoxLink.propTypes = {
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
};

export default ButtonCopyBoxLink;
