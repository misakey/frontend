import React, { useState, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Avatar from '@misakey/ui/Avatar';
import Grow from '@material-ui/core/Grow';

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
      <Avatar
        alt={t('components:client.logoAlt', { clientName: name })}
        src={src}
        onError={handleLoaded}
        onLoad={handleLoaded}
        {...omitTranslationProps(rest)}
      >
        {name.slice(0, 3)}
      </Avatar>
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
