import { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';

import Avatar from '@misakey/ui/Avatar';
import Chip from '@material-ui/core/Chip';

import DomainIcon from '@material-ui/icons/Domain';

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

const ChipDomain = forwardRef(({
  identifier, displayName, label, avatarUrl,
  onClick, onDelete,
  ...props
}, ref) => {
  const events = useEvents(onClick, onDelete);

  return (
    <Chip
      ref={ref}
      component="div"
      avatar={(
        <Avatar>
          <DomainIcon fontSize="small" />
        </Avatar>
      )}
      label={label || identifier}
      variant="outlined"
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

  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

ChipDomain.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  label: null,
  onDelete: null,
  onClick: null,
};

export default ChipDomain;
