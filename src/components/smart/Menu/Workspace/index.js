import React, { useMemo, useState, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { WORKSPACE } from 'constants/workspaces';
import routes from 'routes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';
import __ from '@misakey/helpers/__';
import propOr from '@misakey/helpers/propOr';

import { useRouteMatch, Link, generatePath } from 'react-router-dom';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';
import { MAIN_DOMAIN_REGEX } from 'constants/regex';

// CONSTANTS
const MENU_ID = 'menu-workspace';

const APPLICATION_TO = {
  [WORKSPACE.CITIZEN]: routes.citizen.application._,
  [WORKSPACE.DPO]: routes.dpo.service._,
};

const NO_APPLICATION_TO = {
  [WORKSPACE.CITIZEN]: routes.citizen._,
  [WORKSPACE.DPO]: routes.dpo._,
};

const ROLES = [WORKSPACE.CITIZEN, WORKSPACE.DPO];

// HELPERS
// this is a bit surprising when not used to ramda,
// do not hesitate to ask what it does or check: https://ramdajs.com/docs/#__
const applicationToOrEmpty = propOr('', __, APPLICATION_TO);
const noApplicationToOrEmpty = propOr('', __, NO_APPLICATION_TO);

// COMPONENTS
const MenuItemWorkspace = forwardRef(({ appMatch, role, children, ...rest }, ref) => {
  const appPathTo = useMemo(
    () => applicationToOrEmpty(role),
    [role],
  );

  const noAppPathTo = useMemo(
    () => noApplicationToOrEmpty(role),
    [role],
  );

  const to = useMemo(
    () => {
      if (!isNil(appMatch)) {
        const { mainDomain } = appMatch.params;
        if (MAIN_DOMAIN_REGEX.test(mainDomain)) {
          return generatePath(appPathTo, appMatch.params);
        }
      }
      return noAppPathTo;
    },
    [appMatch, appPathTo, noAppPathTo],
  );

  return (
    <MenuItem
      ref={ref}
      component={Link}
      to={to}
      {...omitTranslationProps(rest)}
    >
      {children}
    </MenuItem>
  );
});

MenuItemWorkspace.propTypes = {
  appMatch: PropTypes.shape({
    params: PropTypes.object,
  }),
  role: PropTypes.string.isRequired,
  children: PropTypes.node,
};

MenuItemWorkspace.defaultProps = {
  appMatch: false,
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

  const appCitizenMatch = useRouteMatch(routes.citizen.application._);
  const appDpoMatch = useRouteMatch(routes.dpo.service._);

  const appMatch = useMemo(
    () => appCitizenMatch || appDpoMatch,
    [appCitizenMatch, appDpoMatch],
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
            appMatch={appMatch}
            selected={role === workspace}
          >
            {t(`common__new:workspaces.${role}`)}
          </MenuItemWorkspace>
        ))}
      </Menu>
    </>
  );
};

MenuWorkspace.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('common__new')(MenuWorkspace);
