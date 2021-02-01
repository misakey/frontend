import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import IconButton from '@misakey/ui/IconButton';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import InfoIcon from '@material-ui/icons/Info';

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
const ListItemSecondaryActionWhitelist = ({ id, color, accessStatus, onRemove }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const classes = useStyles();
  const { t } = useTranslation(['components', 'common']);

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
          <IconButton
            color={color}
            onClick={onClick}
            size="small"
          >
            <InfoIcon />
            {isNil(anchorEl) ? <KeyboardArrowRightIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        )}
        {(!isXs && hasOnRemove) && (
        <Button
          standing={BUTTON_STANDINGS.CANCEL}
          color={color}
          onClick={onClick}
          text={(
            <>
              {t(`components:whitelist.${accessStatus}`)}
              {isNil(anchorEl) ? <KeyboardArrowRightIcon /> : <KeyboardArrowDownIcon />}
            </>
            )}
          size="small"
        />
        )}
        {!hasMenu && (
          <Subtitle
            color={color}
            classes={{ root: clsx(classes.subtitleRoot, classes.subtitleStatus) }}
          >
            {t(`components:whitelist.${accessStatus}`)}
          </Subtitle>
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
            <MenuItem selected>
              <Subtitle color={color} classes={{ root: classes.subtitleRoot }}>
                {t(`components:whitelist.${accessStatus}`)}
              </Subtitle>
            </MenuItem>
          )}
          {hasOnRemove && (
            <MenuItem onClick={handleRemove}>{t('common:remove')}</MenuItem>
          )}
        </Menu>
      )}
    </>
  );
};

ListItemSecondaryActionWhitelist.propTypes = {
  onRemove: PropTypes.func,
  id: PropTypes.string.isRequired,
  accessStatus: PropTypes.string.isRequired,
  color: PropTypes.string,
};

ListItemSecondaryActionWhitelist.defaultProps = {
  onRemove: null,
  color: 'inherit',
};

export default ListItemSecondaryActionWhitelist;
