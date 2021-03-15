import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import List from '@material-ui/core/List';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listBordered: ({ borderTop, borderRight, borderBottom, borderLeft }) => ({
    borderTop: borderTop ? `1px solid ${theme.palette.divider}` : null,
    borderRight: borderRight ? `1px solid ${theme.palette.divider}` : null,
    borderBottom: borderBottom ? `1px solid ${theme.palette.divider}` : null,
    borderLeft: borderLeft ? `1px solid ${theme.palette.divider}` : null,
    borderRadius: (borderTop && borderRight && borderBottom && borderLeft)
      ? theme.shape.borderRadius : null,
  }),
}));

// COMPONENTS
const ListBordered = ({ x, y, t, b, l, r, ...props }) => {
  const borderTop = useMemo(
    () => (isNil(t) && isNil(b) ? y : t),
    [b, t, y],
  );

  const borderRight = useMemo(
    () => (isNil(r) && isNil(l) ? x : r),
    [l, r, x],
  );

  const borderBottom = useMemo(
    () => (isNil(b) && isNil(t) ? y : b),
    [b, t, y],
  );

  const borderLeft = useMemo(
    () => (isNil(l) && isNil(r) ? x : l),
    [l, r, x],
  );

  const classes = useStyles({ borderTop, borderRight, borderLeft, borderBottom });

  return (
    <List className={classes.listBordered} {...props} />
  );
};

ListBordered.propTypes = {
  x: PropTypes.bool,
  y: PropTypes.bool,
  t: PropTypes.bool,
  b: PropTypes.bool,
  l: PropTypes.bool,
  r: PropTypes.bool,
};

ListBordered.defaultProps = {
  x: true,
  y: true,
  t: null,
  b: null,
  l: null,
  r: null,
};

export default ListBordered;
