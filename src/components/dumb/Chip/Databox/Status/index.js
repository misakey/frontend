import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { OPEN, REOPEN, DONE, CLOSED } from 'constants/databox/status';
import DataboxSchema from 'store/schemas/Databox';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import getDateFormat from '@misakey/helpers/getDateFormat';
import { getStatus } from '@misakey/helpers/databox';

import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ChipDateSince from 'components/dumb/Chip/DateSince';
import Popover from '@material-ui/core/Popover';
import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/Inbox';
import RestoreIcon from '@material-ui/icons/Restore';
import DoneIcon from '@material-ui/icons/Done';
import LockIcon from '@material-ui/icons/Lock';
import InfoIcon from '@material-ui/icons/Info';
import EventIcon from '@material-ui/icons/Event';
import EditIcon from '@material-ui/icons/Edit';
import NotesIcon from '@material-ui/icons/Notes';

// CONSTANTS
const STATUS_ICON = {
  [OPEN]: <InboxIcon />,
  [REOPEN]: <RestoreIcon />,
  [DONE]: <DoneIcon />,
  [CLOSED]: <LockIcon />,
};

const POPOVER_CONFIG = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  chipRoot: {
    cursor: 'inherit',
  },
  chipClickable: {
    cursor: 'pointer',
  },
  chipIcon: {
    color: ({ status }) => {
      if (status === DONE) {
        return theme.palette.secondary.main;
      }
      if (status === CLOSED) {
        return theme.palette.primary.main;
      }
      return 'inherit';
    },
  },
}));

// COMPONENTS
const ChipDataboxStatus = ({ databox, t, showIcon, showDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const popoverOpen = useMemo(
    () => Boolean(anchorEl),
    [anchorEl],
  );

  const status = useMemo(
    () => getStatus(databox),
    [databox],
  );

  const classes = useStyles({ status });

  const statusIcon = useMemo(
    () => ((isNil(status) || !showIcon) ? null : STATUS_ICON[status]),
    [showIcon, status],
  );

  const dateCreation = useMemo(
    () => (isNil(databox)
      ? null
      : getDateFormat(databox.createdAt)),
    [databox],
  );

  const calendarDateSinceCreated = useCalendarDateSince(databox.createdAt);
  const calendarDateSinceUpdated = useCalendarDateSince(databox.updatedAt);

  const textSinceCreated = useMemo(
    () => `${t('common__new:databox.since.created')} ${calendarDateSinceCreated} (${dateCreation})`,
    [calendarDateSinceCreated, dateCreation, t],
  );

  const date = useMemo(
    () => {
      if (isNil(databox)) {
        return null;
      }
      if (status === OPEN) {
        return databox.createdAt;
      }
      return databox.updatedAt;
    },
    [databox, status],
  );

  const hasUpdate = useMemo(
    () => !isNil(databox.createdAt)
      && !isNil(databox.updatedAt)
      && databox.createdAt !== databox.updatedAt,
    [databox],
  );

  const textSinceUpdated = useMemo(
    () => (hasUpdate
      ? `${t('common__new:databox.since.updated')} ${calendarDateSinceUpdated} (${getDateFormat(databox.updatedAt)})`
      : null),
    [hasUpdate, t, calendarDateSinceUpdated, databox.updatedAt],
  );

  const commentType = useMemo(
    () => {
      if (isNil(databox)) {
        return null;
      }
      if (databox.status === DONE) {
        return 'dpoComment';
      }
      if (databox.status === CLOSED) {
        return 'ownerComment';
      }
      return null;
    },
    [databox],
  );

  const comment = useMemo(
    () => {
      if (isNil(commentType)) {
        return null;
      }
      return prop(commentType, databox);
    },
    [commentType, databox],
  );

  const onPopoverOpen = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const onPopoverClose = useCallback(
    (event) => {
      setAnchorEl(null);
      event.stopPropagation();
    },
    [setAnchorEl],
  );

  const onDelete = useMemo(
    () => (showDetails ? onPopoverOpen : null),
    [showDetails, onPopoverOpen],
  );

  const onDeleteStopPropagation = useCallback(
    (event) => {
      if (isFunction(onDelete)) {
        onDelete(event);
      }
      event.stopPropagation();
    },
    [onDelete],
  );

  const onClick = useMemo(
    () => (showDetails ? onDeleteStopPropagation : null),
    [onDeleteStopPropagation, showDetails],
  );


  if (isNil(databox)) {
    return null;
  }

  return (
    <div>
      <ChipDateSince
        classes={{
          icon: classes.chipIcon,
          root: classes.chipRoot,
          clickable: classes.chipClickable,
        }}
        color="default"
        icon={statusIcon}
        date={date}
        text={t(`common__new:databox.since.${status}`)}
        deleteIcon={<InfoIcon color="primary" />}
        onClick={onClick}
        onDelete={onDelete}
      />
      <Popover
        id="chip-databox-status-popover"
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        {...POPOVER_CONFIG}
      >
        <Box p={2}>
          <Title>{t('common__new:details')}</Title>
          <List aria-label={t('common__new:details')}>
            <ListItem>
              <ListItemIcon>
                <EventIcon />
              </ListItemIcon>
              <ListItemText primary={textSinceCreated} />
            </ListItem>
            {hasUpdate && (
              <ListItem>
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText primary={textSinceUpdated} />
              </ListItem>
            )}
            {comment && (
              <ListItem>
                <ListItemIcon>
                  <NotesIcon />
                </ListItemIcon>
                <ListItemText primary={t(`common__new:databox.${commentType}.${comment}`)} />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </div>
  );
};

ChipDataboxStatus.propTypes = {
  databox: PropTypes.shape(DataboxSchema.propTypes),
  t: PropTypes.func.isRequired,
  showIcon: PropTypes.bool,
  showDetails: PropTypes.bool,
};

ChipDataboxStatus.defaultProps = {
  databox: null,
  showIcon: false,
  showDetails: false,
};

export default withTranslation('common__new')(ChipDataboxStatus);
