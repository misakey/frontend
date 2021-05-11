import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Avatar from '@misakey/ui/Avatar';
import Chip from '@misakey/ui/Chip';

import DomainIcon from '@material-ui/icons/Domain';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';

// HOOKS
const useStyles = makeStyles((theme) => ({
  chipRoot: {
    '& .MuiChip-avatar': {
      color: theme.palette.background.default,
    },
  },
  errorForceColor: {
    color: theme.palette.error.main,
  },
}));

const useEvents = (onClick, onDelete) => useMemo(() => {
  const events = {};
  if (isFunction(onClick)) {
    events.onClick = onClick;
  }
  if (isFunction(onDelete)) {
    events.onDelete = onDelete;
  }

  return events;
}, [onClick, onDelete]);

// COMPONENTS
const ChipDomain = forwardRef(({
  identifier, displayName, label, avatarUrl,
  error,
  onClick, onDelete,
  ...props
}, ref) => {
  const classes = useStyles();

  const events = useEvents(onClick, onDelete);

  const errorProps = useMemo(
    () => (error ? { color: 'error' } : {}),
    [error],
  );

  return (
    <Chip
      classes={{ root: classes.chipRoot }}
      ref={ref}
      component="div"
      icon={error ? <ErrorOutlineIcon className={classes.errorForceColor} color="error" fontSize="small" /> : null}
      avatar={error ? null : (
        <Avatar>
          {error
            ? null
            : <DomainIcon fontSize="small" />}
        </Avatar>
      )}
      label={label || identifier}
      variant="outlined"
      {...errorProps}
      {...events}
      {...props}
    />
  );
});

ChipDomain.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  label: PropTypes.string,
  avatarUrl: PropTypes.string,
  error: PropTypes.bool,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

ChipDomain.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  error: false,
  label: null,
  onDelete: null,
  onClick: null,
};

export default ChipDomain;
