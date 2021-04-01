import React, { useState, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import Grow from '@material-ui/core/Grow';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';

// COMPONENTS
function AvatarClient({
  children, src, name, t, ...rest
}) {
  const [isLoaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => { setLoaded(true); }, [setLoaded]);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Grow in={isLoaded || !src}>
      <AvatarColorized
        alt={t('components:client.logoAlt', { clientName: name })}
        image={src}
        text={name}
        colorizedProp={BACKGROUND_COLOR}
        onError={handleLoaded}
        onLoad={handleLoaded}
        {...omitTranslationProps(rest)}
      />
    </Grow>
  );
}

AvatarClient.propTypes = {
  children: PropTypes.node,
  src: PropTypes.string,
  name: PropTypes.string,
  t: PropTypes.func.isRequired,
};

AvatarClient.defaultProps = {
  children: undefined,
  src: undefined,
  name: '',
};

export default withTranslation(['components'])(AvatarClient);
