import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';

// COMPONENTS
const AvatarClient = forwardRef(({
  children, src, name,
  ...rest
}, ref) => {
  const { t } = useTranslation('components');

  return (
    <AvatarColorized
      ref={ref}
      alt={t('components:client.logoAlt', { clientName: name })}
      image={src}
      text={name}
      colorizedProp={BACKGROUND_COLOR}
      {...rest}
    />
  );
});

AvatarClient.propTypes = {
  children: PropTypes.node,
  src: PropTypes.string,
  name: PropTypes.string,
};

AvatarClient.defaultProps = {
  children: undefined,
  src: undefined,
  name: '',
};

export default AvatarClient;
