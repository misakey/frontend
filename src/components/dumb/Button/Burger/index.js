import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import identity from '@misakey/helpers/identity';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

/**
 * @FIXME add to @misakey/ui
 * @param className
 * @param handleClick
 * @param t
 * @returns {*}
 * @constructor
 */
function ButtonBurger({ className, onClick, t }) {
  return (
    <IconButton
      color="inherit"
      aria-label={t('nav:drawer.toggle')}
      onClick={onClick}
      edge="start"
      className={className}
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
  onClick: identity,
};

export default withTranslation('nav')(ButtonBurger);
