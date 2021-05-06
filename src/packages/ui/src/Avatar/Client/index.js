import React, { useMemo, useState, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import { useTranslation } from 'react-i18next';

import Grow from '@material-ui/core/Grow';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';

// COMPONENTS
function AvatarClient({
  children, src, name,
  transitionProps: { in: externalIn, ...transitionPropsRest },
  ...rest
}) {
  const [isLoaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => { setLoaded(true); }, [setLoaded]);

  const { t } = useTranslation('components');

  const internalIn = useMemo(
    () => isLoaded || !src,
    [isLoaded, src],
  );

  const growIn = useMemo(
    () => (isNil(externalIn)
      ? internalIn
      : externalIn && internalIn),
    [externalIn, internalIn],
  );

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Grow in={growIn} {...transitionPropsRest}>
      <AvatarColorized
        alt={t('components:client.logoAlt', { clientName: name })}
        image={src}
        text={name}
        colorizedProp={BACKGROUND_COLOR}
        onError={handleLoaded}
        onLoad={handleLoaded}
        {...rest}
      />
    </Grow>
  );
}

AvatarClient.propTypes = {
  children: PropTypes.node,
  src: PropTypes.string,
  name: PropTypes.string,
  transitionProps: PropTypes.object,
};

AvatarClient.defaultProps = {
  children: undefined,
  src: undefined,
  name: '',
  transitionProps: {},
};

export default AvatarClient;
