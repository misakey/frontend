import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';

import isNil from '@misakey/helpers/isNil';

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
  t,
}) => {
  const classes = useStyles();
  const { sender, type } = useMemo(() => event, [event]);
  const { displayName, id } = useMemo(() => sender, [sender]);
  const author = useMemo(
    () => (!isNil(id) ? 'you' : 'they'),
    [id],
  );

  return (
    <Typography variant="caption" color="textSecondary" className={classes.root}>
      {t(`boxes:read.events.information.${type}.${author}`, { displayName })}
    </Typography>
  );
};

BoxInformationEvent.propTypes = {
  event: PropTypes.shape(ActivityLogsSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(BoxInformationEvent);
