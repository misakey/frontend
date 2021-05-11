import React from 'react';

import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';

// COMPONENTS
function AvatarClient({
  children, src, name,
  ...rest
}) {
  const { t } = useTranslation('components');

  return (
    <AvatarColorized
      alt={t('components:client.logoAlt', { clientName: name })}
      image={src}
      text={name}
      colorizedProp={BACKGROUND_COLOR}
      {...rest}
    />
  );
}

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
