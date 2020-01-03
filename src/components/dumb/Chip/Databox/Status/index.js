import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import { OPEN, REOPEN, DONE, CLOSED } from 'constants/databox/status';
import DataboxSchema from 'store/schemas/Databox';

import isObject from '@misakey/helpers/isObject';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import getDateFormat from 'helpers/getDateFormat';

import useCalendarDateSince from 'hooks/useCalendarDateSince';

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

// HELPERS
const isReopen = ({
  status,
  createdAt,
  updatedAt,
}) => status === OPEN && moment(updatedAt).isAfter(createdAt);

const getStatus = (databox) => {
  if (!isObject(databox)) {
    return null;
  }
  if (isReopen(databox)) {
    return REOPEN;
  }
  return databox.status;
};

// HOOKS
const useStyles = makeStyles((theme) => ({
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
const ChipDataboxStatus = ({ databox, t }) => {
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
    () => (isNil(status) ? null : STATUS_ICON[status]),
    [status],
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
    () => `${t('common:databox.since.created')} ${calendarDateSinceCreated} (${dateCreation})`,
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
      ? `${t('common:databox.since.updated')} ${calendarDateSinceUpdated} (${getDateFormat(databox.updatedAt)})`
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

  const onClick = useCallback(
    (event) => {
      if (isFunction(onPopoverOpen)) {
        onPopoverOpen(event);
      }
      event.stopPropagation();
    },
    [onPopoverOpen],
  );

  if (isNil(databox)) {
    return null;
  }

  return (
    <div>
      <ChipDateSince
        classes={{ icon: classes.chipIcon }}
        color="default"
        icon={statusIcon}
        date={date}
        text={t(`common:databox.since.${status}`)}
        deleteIcon={<InfoIcon color="primary" />}
        onClick={onClick}
        onDelete={onPopoverOpen}
      />
      <Popover
        id="chip-databox-status-popover"
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        {...POPOVER_CONFIG}
      >
        <Box p={2}>
          <Title>{t('common:databox.details.title')}</Title>
          <List aria-label={t('common:databox.details.title')}>
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
                <ListItemText primary={t(`common:databox.${commentType}.${comment}`)} />
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
};

ChipDataboxStatus.defaultProps = {
  databox: null,
};

export default withTranslation('common')(ChipDataboxStatus);
