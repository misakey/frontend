import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Button from 'components/dumb/Button';

// COMPONENTS
function ButtonGoBack({ className, homePath, t, ...props }) {
  const { length, goBack, push } = useHistory();

  const canGoBack = useMemo(
    () => length > 1,
    [length],
  );

  const handleGoHome = useCallback(
    () => {
      push(homePath);
    },
    [push, homePath],
  );

  const handleGoBack = useCallback(
    () => {
      goBack();
    },
    [goBack],
  );

  return (
    <Button
      onClick={canGoBack ? handleGoBack : handleGoHome}
      className={className}
      {...omitTranslationProps(props)}
      text={t('common:navigation.history.goBack')}
    />
  );
}

ButtonGoBack.propTypes = {
  className: PropTypes.string,
  homePath: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ButtonGoBack.defaultProps = {
  className: '',
  homePath: '/',
};

export default withTranslation('common')(ButtonGoBack);
