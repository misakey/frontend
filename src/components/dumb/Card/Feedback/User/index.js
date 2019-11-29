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

// CONSTANTS
const TITLE_TYPO_PROPS = {
  variant: 'h6',
  color: 'textSecondary',
};

const NO_USER_INFO = {};

// HELPERS
const userInfoProp = propOr(NO_USER_INFO, 'user');

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardHeaderTitle: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  cardHeaderAvatar: {
    display: 'flex',
    alignItems: 'center',
  },
  colorizedAvatarRoot: {
    width: '25px',
    height: '25px',
  },
  ratingIconFilled: {
    color: theme.palette.primary.main,
  },
}));

// COMPONENTS
const UserFeedbackCard = ({ isAuthenticated, rating, className }) => {
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
    () => (isNil(createdAt) ? '' : moment.parseZone(createdAt).format('ll')),
    [createdAt],
  );

  return (
    <Card className={className}>
      <CardHeader
        classes={{ title: classes.cardHeaderTitle, avatar: classes.cardHeaderAvatar }}
        avatar={(
          <>
            {isAuthenticated ? (
              <ColorizedAvatar
                image={avatarUri}
                text={displayName}
                classes={{ root: classes.colorizedAvatarRoot }}
              />
            ) : (
              <AccountCircleIcon />
            )}

            <Rating
              value={value}
              size="small"
              readOnly
              classes={{
                iconFilled: classes.ratingIconFilled,
              }}
            />
          </>
        )}
        title={createdAtText}
        titleTypographyProps={TITLE_TYPO_PROPS}

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
};

UserFeedbackCard.defaultProps = {
  isAuthenticated: false,
  className: '',
};

export default withTranslation('common')(UserFeedbackCard);
