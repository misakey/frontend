import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import Chip from '@misakey/ui/Chip';

import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';


// HOOKS
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

const useStyles = makeStyles((theme) => ({
  errorForceColor: {
    color: theme.palette.error.main,
  },
}));

// COMPONENTS
const ChipUser = forwardRef(({
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
      ref={ref}
      component="div"
      icon={error ? (<ErrorOutlineIcon className={classes.errorForceColor} color="error" fontSize="small" />) : null}
      avatar={
        error ? null
          : <AvatarColorized text={displayName || identifier} image={avatarUrl} />
      }
      label={label || displayName || identifier}
      variant="outlined"
      {...errorProps}
      {...events}
      {...props}
    />
  );
});

ChipUser.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  label: PropTypes.string,
  avatarUrl: PropTypes.string,
  error: PropTypes.bool,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

ChipUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  label: null,
  error: false,
  onDelete: null,
  onClick: null,
};

export default ChipUser;
