import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import Chip from '@material-ui/core/Chip';

import isFunction from '@misakey/helpers/isFunction';

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

const ChipUser = forwardRef(({
  identifier, displayName, label, avatarUrl,
  onClick, onDelete,
  ...props
}, ref) => {
  const events = useEvents(onClick, onDelete);

  return (
    <Chip
      ref={ref}
      component="div"
      avatar={<AvatarColorized text={displayName || identifier} image={avatarUrl} />}
      label={label || displayName || identifier}
      variant="outlined"
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

  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

ChipUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  label: null,
  onDelete: null,
  onClick: null,
};

export default ChipUser;
