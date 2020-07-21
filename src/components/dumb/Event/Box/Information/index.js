import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import BoxEventsSchema from 'store/schemas/Boxes/Events';
import { LIFECYCLE } from 'constants/app/boxes/events';

import EventBoxInformationPreview from 'components/dumb/Event/Box/Information/Preview';

const useStyles = makeStyles((theme) => ({
  root: {
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
  const { sender, type, content } = useMemo(() => event, [event]);
  const { displayName } = useMemo(() => sender, [sender]);

  const author = useMemo(
    () => (isFromCurrentUser ? 'you' : 'they'),
    [isFromCurrentUser],
  );

  const text = useMemo(
    () => {
      if (type === LIFECYCLE) {
        return t(`boxes:read.events.information.lifecycle.${content.state}.${author}`, { displayName });
      }
      return t(`boxes:read.events.information.${type}.${author}`, { displayName, ...content });
    }, [author, content, displayName, t, type],
  );

  if (preview) {
    return (
      <EventBoxInformationPreview
        displayName={displayName}
        isFromCurrentUser={isFromCurrentUser}
        content={content}
        type={type}
      />
    );
  }

  return (
    <Typography variant="caption" color="textSecondary" className={classes.root}>
      {text}
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
