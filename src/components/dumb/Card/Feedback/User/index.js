import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';

import RatingSchema from 'store/schemas/Rating';

import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';

import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Typography from '@material-ui/core/Typography';
import Card from 'components/dumb/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Rating from '@material-ui/lab/Rating';
import ColorizedAvatar from 'components/dumb/Avatar/Colorized';
import Box from '@material-ui/core/Box';


const NO_USER_INFO = {};

// HELPERS
const userInfoProp = propOr(NO_USER_INFO, 'user');

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardHeader: {
    marginBottom: 0,
    paddingBottom: 0,
  },
  ratingIconFilled: {
    color: theme.palette.primary.main,
  },
  displayName: {
    marginLeft: theme.spacing(1),
  },
  rating: {
    marginRight: theme.spacing(1),
  },
  ratingAndDate: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
}));

// COMPONENTS
const UserFeedbackCard = ({ isAuthenticated, rating, className, t }) => {
  const classes = useStyles();

  const { displayName, avatarUri } = useMemo(
    () => userInfoProp(rating),
    [rating],
  );

  const { value, comment, createdAt } = useMemo(
    () => rating,
    [rating],
  );

  const createdAtText = useMemo(
    () => (isNil(createdAt) ? '' : moment(createdAt).fromNow()),
    [createdAt],
  );

  return (
    <Card className={className}>
      <CardHeader
        className={classes.cardHeader}
        avatar={(
          <>
            {isAuthenticated ? (
              <ColorizedAvatar
                image={avatarUri}
                text={displayName}
                classes={{ root: classes.colorizedAvatarRoot }}
              />
            ) : (
              <AccountCircleIcon fontSize="large" />
            )}
          </>
        )}
        title={(isAuthenticated) ? displayName : t('common:anonymousUser')}
        subheader={(
          <Box className={classes.ratingAndDate}>
            <Rating
              value={value}
              size="small"
              readOnly
              classes={{
                root: classes.rating,
                iconFilled: classes.ratingIconFilled,
              }}
            />
            <Typography color="textSecondary" noWrap>
              {createdAtText}
            </Typography>
          </Box>
        )}
      />
      <CardContent>
        <Typography variant="body2" color="textPrimary">
          {comment}
        </Typography>
      </CardContent>
    </Card>
  );
};

UserFeedbackCard.propTypes = {
  isAuthenticated: PropTypes.bool,
  className: PropTypes.string,
  rating: PropTypes.shape(RatingSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

UserFeedbackCard.defaultProps = {
  isAuthenticated: false,
  className: '',
};

export default withTranslation('common')(UserFeedbackCard);
