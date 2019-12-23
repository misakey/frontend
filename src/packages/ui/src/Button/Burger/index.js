import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import identity from '@misakey/helpers/identity';
import tDefault from '@misakey/helpers/tDefault';

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

function ButtonBurger({ className, onClick, t }) {
  return (
    <IconButton
      color="inherit"
      aria-label={t('navigation.drawer.toggle')}
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
  t: PropTypes.func,
};

ButtonBurger.defaultProps = {
  className: '',
  onClick: identity,
  t: tDefault,
};

export default withTranslation()(ButtonBurger);
