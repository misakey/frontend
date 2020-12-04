import PropTypes from 'prop-types';

import EventSchema from 'store/schemas/Boxes/Events';
import SenderSchema from 'store/schemas/Boxes/Sender';

import { TIME } from 'constants/formats/dates';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import Box from '@material-ui/core/Box';
import BoxEventDeletedPreview from 'components/smart/Box/Event/Deleted/Preview';
import EventCard from 'components/dumb/Card/Event';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

// HOOKS
const useStyles = makeStyles((theme) => ({
  iconSpaced: {
    marginRight: theme.spacing(1),
  },
}));

// COMPONENTS
const BoxEventDeleted = ({
  atTime, byIdentity,
  isFromCurrentUser, boxBelongsToCurrentUser, preview, event,
  ...props
}) => {
  const classes = useStyles();

  const { sender: author, serverEventCreatedAt } = useSafeDestr(event);

  const atTimeText = useDateFormatMemo(serverEventCreatedAt, TIME);

  if (preview) {
    return <BoxEventDeletedPreview byIdentity={byIdentity} {...props} />;
  }

  return (
    <EventCard
      author={author}
      date={atTimeText}
      text={(
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <NotInterestedIcon fontSize="small" className={classes.iconSpaced} />
            <BoxEventDeletedPreview byIdentity={byIdentity} />
          </Box>
        </>
      )}
      isFromCurrentUser={isFromCurrentUser}
      {...props}
    />
  );
};

BoxEventDeleted.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  atTime: PropTypes.string,
  byIdentity: PropTypes.shape(SenderSchema.propTypes),
  preview: PropTypes.bool,
  isFromCurrentUser: PropTypes.bool,
  boxBelongsToCurrentUser: PropTypes.bool,
};

BoxEventDeleted.defaultProps = {
  atTime: null,
  byIdentity: null,
  preview: false,
  isFromCurrentUser: false,
  boxBelongsToCurrentUser: false,
};

export default BoxEventDeleted;
