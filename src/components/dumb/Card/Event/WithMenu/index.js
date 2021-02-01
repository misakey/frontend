import React, { useMemo, useState, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTouchAnchorPosition from '@misakey/hooks/useTouchAnchor/position';
import useContextMenuAnchorPosition from '@misakey/hooks/useContextMenuAnchor/position';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ContextMenu from '@misakey/ui/Menu/ContextMenu';
import CardEvent from 'components/dumb/Card/Event';

import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

// HOOKS
const useStyles = makeStyles((theme) => ({
  selected: {
    borderTopColor: theme.palette.divider,
    borderBottomColor: theme.palette.divider,
  },
  menu: {
    position: 'absolute',
    top: -24, // IconButton height / 2
    right: 0,
  },
}));

const CardEventWithMenu = forwardRef(({
  children,
  classes: { root: rootClass, ...restClasses },
  items,
  actions,
  titleProps,
  ...rest
}, ref) => {
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [buttonVisible, setButtonVisible] = useState(false);
  const internalClasses = useStyles();

  const hasAnchorPosition = useMemo(
    () => anchorPosition !== null,
    [anchorPosition],
  );

  const onCloseMenu = useCallback(
    () => {
      setAnchorPosition(null);
    },
    [setAnchorPosition],
  );

  const touchAnchorProps = useTouchAnchorPosition({
    onAnchor: setAnchorPosition,
    canAnchor: !isEmpty(items),
  });
  const { onContextMenu } = useContextMenuAnchorPosition({
    onAnchor: setAnchorPosition,
    canAnchor: !isEmpty(items),
  });

  const onMouseEnter = useCallback(
    () => {
      setButtonVisible(true);
    },
    [setButtonVisible],
  );

  const onMouseLeave = useCallback(
    () => {
      setButtonVisible(false);
    },
    [setButtonVisible],
  );

  const hoverProps = useMemo(
    () => ({
      onMouseEnter,
      onMouseLeave,
    }),
    [onMouseEnter, onMouseLeave],
  );

  return (
    <>
      <CardEvent
        ref={ref}
        containerProps={hoverProps}
        classes={{
          root: clsx(rootClass, { [internalClasses.selected]: hasAnchorPosition }),
          ...restClasses,
        }}
        onContextMenu={onContextMenu}
        content={children}
        {...touchAnchorProps}
        {...rest}
      >
        {buttonVisible && (
          <Paper
            component={Box}
            mx={2}
            variant="outlined"
            display="flex"
            justifyContent="center"
            className={internalClasses.menu}
          >
            <IconButton onClick={onContextMenu}>
              <MoreHorizIcon />
            </IconButton>
          </Paper>
        )}
      </CardEvent>
      <ContextMenu
        anchorPosition={anchorPosition}
        onClose={onCloseMenu}
      >
        {items}
      </ContextMenu>
    </>
  );
});

CardEventWithMenu.propTypes = {
  items: PropTypes.node,
  children: PropTypes.node,
  classes: PropTypes.shape({
    root: PropTypes.string,
  }),
  titleProps: PropTypes.object,
  actions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.node])),
    PropTypes.object,
    PropTypes.node,
  ]),
};

CardEventWithMenu.defaultProps = {
  items: null,
  children: null,
  classes: {},
  titleProps: {},
  actions: null,
};

export default CardEventWithMenu;
