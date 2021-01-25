import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';

import BoxSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import MenuItemBoxLinkRenew from 'components/smart/MenuItem/BoxLink/Renew';

// COMPONENTS
function MenuBoxLink({ box, ...rest }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const onMenuClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const onClose = useCallback(
    () => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  return (
    <>
      <IconButton onClick={onMenuClick} edge="end" aria-label="menu-more" {...rest}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!isNil(anchorEl)}
        onClose={onClose}
        onClick={onClose}
        keepMounted
        variant="menu"
        MenuListProps={{ disablePadding: true }}
        PaperProps={{ variant: 'outlined' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItemBoxLinkRenew box={box} onClose={onClose} />
      </Menu>
    </>
  );
}

MenuBoxLink.propTypes = {
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
};

export default MenuBoxLink;
