import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import noop from '@misakey/core/helpers/noop';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

function ButtonBurger({ className, onClick, t, ...rest }) {
  return (
    <IconButton
      color="inherit"
      aria-label={t('components:drawer.toggle')}
      onClick={onClick}
      className={className}
      {...omitTranslationProps(rest)}
    >
      <MenuIcon />
    </IconButton>
  );
}

ButtonBurger.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  t: PropTypes.func.isRequired,
};

ButtonBurger.defaultProps = {
  className: '',
  onClick: noop,
};

export default withTranslation('components')(ButtonBurger);
