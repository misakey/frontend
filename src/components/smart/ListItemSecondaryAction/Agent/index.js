import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';

import isFunction from '@misakey/core/helpers/isFunction';
import isNil from '@misakey/core/helpers/isNil';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import IconButton from '@misakey/ui/IconButton';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import BadgeNew from '@misakey/ui/Badge/New';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

// CONSTANTS
export const AGENT = 'agent';
export const ADMIN = 'admin';
export const ROLES = [AGENT, ADMIN];

const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  subtitleRoot: {
    textTransform: 'uppercase',
  },
  subtitleStatus: {
    fontSize: theme.typography.pxToRem(13),
    marginRight: theme.spacing(3),
  },
}));

// COMPONENTS
const ListItemSecondaryActionAgent = ({ id, onRemove, role, isNew }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();
  const { t } = useTranslation(['organizations', 'common']);

  const isXs = useXsMediaQuery();

  const onClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const hasOnRemove = useMemo(
    () => isFunction(onRemove),
    [onRemove],
  );

  const hasMenu = useMemo(
    () => isXs || hasOnRemove,
    [isXs, hasOnRemove],
  );

  const onClose = useCallback(
    () => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  const handleRemove = useCallback(
    (event) => {
      onClose(event);
      if (hasOnRemove) {
        onRemove(event, id);
      }
    },
    [onClose, hasOnRemove, onRemove, id],
  );

  return (
    <>
      <ListItemSecondaryAction>
        {isXs && (
          <BadgeNew isNew={isNew}>
            <IconButton
              color="secondary"
              onClick={onClick}
              size="small"
            >
              {isNil(anchorEl) ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </BadgeNew>
        )}
        {(!isXs && hasOnRemove) && (
          <BadgeNew isNew={isNew}>
            <Button
              standing={BUTTON_STANDINGS.CANCEL}
              color="secondary"
              onClick={onClick}
              text={(
                <>
                  {t(`organizations:agents.role.${role}`)}
                  {isNil(anchorEl) ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </>
              )}
              size="small"
            />
          </BadgeNew>
        )}
        {!hasMenu && (
          <BadgeNew isNew={isNew}>
            <Subtitle
              color="secondary"
              classes={{ root: clsx(classes.subtitleRoot, classes.subtitleStatus) }}
            >
              {t(`organizations:agents.role.${role}`)}
            </Subtitle>
          </BadgeNew>
        )}
      </ListItemSecondaryAction>
      {hasMenu && (
        <Menu
          id="listitem-secondaryaction-whitelist-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={onClose}
          MenuListProps={{ disablePadding: true }}
        >
          {isXs && (
            <AppBarStatic
              toolbarProps={TOOLBAR_PROPS}
              color="primary"
            >
              <Subtitle gutterBottom={false} color="background" classes={{ root: classes.subtitleRoot }}>
                {t(`organizations:agents.role.${role}`)}
              </Subtitle>
            </AppBarStatic>
          )}
          {hasOnRemove && (
            <MenuItem onClick={handleRemove}>{t('organizations:agents.role.revoke')}</MenuItem>
          )}
        </Menu>
      )}
    </>
  );
};

ListItemSecondaryActionAgent.propTypes = {
  onRemove: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  role: PropTypes.oneOf(ROLES),
  isNew: PropTypes.bool,
};

ListItemSecondaryActionAgent.defaultProps = {
  onRemove: null,
  role: AGENT,
  isNew: false,
};

export default ListItemSecondaryActionAgent;
