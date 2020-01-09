import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import RatingSchema from 'store/schemas/Rating';
import routes from 'routes';

import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';

import Card from 'components/dumb/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Rating from '@material-ui/lab/Rating';
import Typography from '@material-ui/core/Typography';

import DeleteMyFeedbackButton from './DeleteButton';

// CONSTANTS
const DISABLED_RATING = null;

// HELPERS
const commentProp = propOr('', 'comment');
const valueProp = propOr(DISABLED_RATING, 'value');

// HOOKS
const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.palette.common.white,
  },
  feedbackLink: {
    textAlign: 'center',
    margin: 'auto',
    display: 'block',
  },
  cardContentRoot: {
    padding: '0 1rem',
  },
  comment: {
    display: 'block',
  },
  commentTypography: {
    whiteSpace: 'pre-wrap',
  },
  ratingIconFilled: {
    color: theme.palette.secondary.main,
  },
  ratingRoot: {
    fontSize: theme.typography.h2.fontSize,
  },
}));

// COMPONENTS
const MyFeedbackCard = ({ mainDomain, rating, t, deleteMyFeedback }) => {
  const disabled = useMemo(
    () => isNil(rating),
    [rating],
  );

  const classes = useStyles(disabled);

  const value = useMemo(
    () => valueProp(rating),
    [rating],
  );

  const comment = useMemo(
    () => commentProp(rating),
    [rating],
  );

  const feedbackKey = useMemo(() => (disabled ? 'give' : 'edit'), [disabled]);

  const linkTo = useMemo(
    () => generatePath(routes.citizen.application.feedback.me, { mainDomain }),
    [mainDomain],
  );

  return (
    <Card
      classes={{ root: classes.card }}
      primary={{
        to: linkTo,
        component: Link,
        'aria-label': t(`common:feedback.${feedbackKey}`),
        text: t(`common:feedback.${feedbackKey}`),
      }}
      secondary={(!isNil(value)) ? (
        <DeleteMyFeedbackButton deleteMyFeedback={deleteMyFeedback} />
      ) : null}
    >
      <CardHeader
        title={t('common:feedback.me')}
        action={(disabled) ? null : (
          <Rating
            value={value}
            readOnly
            disabled={disabled}
            size="large"
            classes={{ iconFilled: classes.ratingIconFilled }}
          />
        )}
      />
      <CardContent classes={{ root: classes.cardContentRoot }}>

        <div className={classes.comment}>
          {disabled ? (
            <Link to={linkTo} className={classes.feedbackLink}>
              <Rating
                name="rating-link"
                value={value}
                size="large"
                classes={{ root: classes.ratingRoot, iconFilled: classes.ratingIconFilled }}
              />
            </Link>
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              className={classes.commentTypography}
            >
              {comment}
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>

  );
};

MyFeedbackCard.propTypes = {
  mainDomain: PropTypes.string.isRequired,
  rating: PropTypes.shape(RatingSchema.propTypes),
  deleteMyFeedback: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

MyFeedbackCard.defaultProps = {
  rating: null,
};

export default withTranslation('common')(MyFeedbackCard);
