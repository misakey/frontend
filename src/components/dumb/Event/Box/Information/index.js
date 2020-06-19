import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import BoxEventsSchema from 'store/schemas/Boxes/Events';

const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: 10,
    padding: theme.spacing(0, 1),
    marginBottom: theme.spacing(1),
    alignSelf: 'center',
  },
}));

const BoxInformationEvent = ({
  event,
  isFromCurrentUser,
  preview,
  t,
}) => {
  const classes = useStyles();
  const { sender, type } = useMemo(() => event, [event]);
  const { displayName } = useMemo(() => sender, [sender]);

  const author = useMemo(
    () => (isFromCurrentUser ? 'you' : 'they'),
    [isFromCurrentUser],
  );

  if (preview) {
    return t(`boxes:read.events.information.${type}.${author}`, { displayName });
  }

  return (
    <Typography variant="caption" color="textSecondary" className={classes.root}>
      {t(`boxes:read.events.information.${type}.${author}`, { displayName })}
    </Typography>
  );
};

BoxInformationEvent.propTypes = {
  event: PropTypes.shape(BoxEventsSchema.propTypes).isRequired,
  isFromCurrentUser: PropTypes.bool,
  t: PropTypes.func.isRequired,
  preview: PropTypes.bool,
};

BoxInformationEvent.defaultProps = {
  preview: false,
  isFromCurrentUser: false,
};

export default withTranslation('boxes')(BoxInformationEvent);
