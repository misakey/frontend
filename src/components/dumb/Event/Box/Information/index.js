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
  getIsFromCurrentUser,
  t,
}) => {
  const classes = useStyles();
  const { sender, type } = useMemo(() => event, [event]);
  const { displayName } = useMemo(() => sender, [sender]);

  const isFromCurrentUser = useMemo(
    () => getIsFromCurrentUser(sender.identifier),
    [getIsFromCurrentUser, sender.identifier],
  );

  const author = useMemo(
    () => (isFromCurrentUser ? 'you' : 'they'),
    [isFromCurrentUser],
  );

  return (
    <Typography variant="caption" color="textSecondary" className={classes.root}>
      {t(`boxes:read.events.information.${type}.${author}`, { displayName })}
    </Typography>
  );
};

BoxInformationEvent.propTypes = {
  event: PropTypes.shape(BoxEventsSchema.propTypes).isRequired,
  getIsFromCurrentUser: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(BoxInformationEvent);
