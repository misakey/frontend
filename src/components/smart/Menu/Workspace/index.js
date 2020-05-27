import React, { useMemo, useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { WORKSPACE } from 'constants/workspaces';
import routes from 'routes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';
import __ from '@misakey/helpers/__';
import propOr from '@misakey/helpers/propOr';

import { Link } from 'react-router-dom';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';

// CONSTANTS
const MENU_ID = 'menu-workspace';

const NO_APPLICATION_TO = {
  [WORKSPACE.CITIZEN]: routes.citizen._,
  [WORKSPACE.DPO]: routes.dpo._,
};

const ROLES = [WORKSPACE.CITIZEN, WORKSPACE.DPO];

// HELPERS
// this is a bit surprising when not used to ramda,
// do not hesitate to ask what it does or check: https://ramdajs.com/docs/#__
const noApplicationToOrEmpty = propOr('', __, NO_APPLICATION_TO);

// COMPONENTS
const MenuItemWorkspace = forwardRef(({ role, children, ...rest }, ref) => {
  const noAppPathTo = useMemo(
    () => noApplicationToOrEmpty(role),
    [role],
  );

  return (
    <MenuItem
      ref={ref}
      component={Link}
      to={noAppPathTo}
      {...omitTranslationProps(rest)}
    >
      {children}
    </MenuItem>
  );
});

MenuItemWorkspace.propTypes = {
  role: PropTypes.string.isRequired,
  children: PropTypes.node,
};

MenuItemWorkspace.defaultProps = {
  children: null,
};

const MenuWorkspace = ({ t }) => {
  const workspace = useLocationWorkspace(true);

  const [anchorEl, setAnchorEl] = useState(null);

  const onClick = useCallback(
    ({ currentTarget }) => { setAnchorEl(currentTarget); },
    [setAnchorEl],
  );

  const onClose = useCallback(
    () => { setAnchorEl(null); },
    [setAnchorEl],
  );

  if (isNil(workspace)) {
    return null;
  }

  return (
    <>
      <IconButton
        aria-controls={MENU_ID}
        onClick={onClick}
        size="small"
      >
        <ArrowDropdownIcon />
      </IconButton>
      <Menu
        id={MENU_ID}
        anchorEl={anchorEl}
        open={!isNil(anchorEl)}
        onClose={onClose}
      >
        {ROLES.map((role) => (
          <MenuItemWorkspace
            key={role}
            role={role}
            selected={role === workspace}
          >
            {t(`common:workspaces.${role}`)}
          </MenuItemWorkspace>
        ))}
      </Menu>
    </>
  );
};

MenuWorkspace.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(MenuWorkspace);
