import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import Chip from '@material-ui/core/Chip';

import isFunction from '@misakey/helpers/isFunction';

const useStyles = makeStyles((theme) => ({
  chip: { margin: theme.spacing(2, 0, 0) },
  moreTypography: { marginTop: theme.spacing(2) },
}));

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

const ChipUser = ({ identifier, displayName, avatarUri, onClick, onDelete }) => {
  const classes = useStyles();

  const events = useEvents(onClick, onDelete);

  return (
    <Chip
      component="div"
      className={classes.chip}
      avatar={<AvatarColorized text={displayName || identifier} image={avatarUri} />}
      label={displayName || identifier}
      variant="outlined"
      {...events}
    />
  );
};

ChipUser.propTypes = {
  identifier: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  avatarUri: PropTypes.string,

  onDelete: PropTypes.func,
  onClick: PropTypes.func,
};

ChipUser.defaultProps = {
  displayName: '',
  avatarUri: '',
  onDelete: null,
  onClick: null,
};

export default ChipUser;
