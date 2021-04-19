import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useDialogBoxesLeaveContext } from 'components/smart/Dialog/Boxes/Leave/Context';

import NoMeetingRoomIcon from '@material-ui/icons/NoMeetingRoom';

// HOOKS
const useStyles = makeStyles(() => ({
  buttonLabel: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const IconButtonBoxesLeave = forwardRef(({ box, ...rest }, ref) => {
  const { t } = useTranslation('boxes');
  const classes = useStyles();

  const label = useMemo(
    () => t('boxes:read.details.menu.leave.primary'),
    [t],
  );

  const { onOpen } = useDialogBoxesLeaveContext();

  return (
    <Button
      ref={ref}
      onClick={onOpen}
      variant="text"
      classes={{ label: classes.buttonLabel }}
      aria-label={label}
      {...rest}
    >
      <NoMeetingRoomIcon color="action" />
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
    </Button>
  );
});

IconButtonBoxesLeave.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesLeave;
