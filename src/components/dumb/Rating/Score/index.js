import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import isArray from '@misakey/helpers/isArray';
import isNil from '@misakey/helpers/isNil';

import LinearProgress from '@material-ui/core/LinearProgress';
import Rating from '@material-ui/lab/Rating';
import Box from '@material-ui/core/Box';


// CONSTANTS
const MIN = 0;

// HELPERS
// Function to normalize the values (MIN / MAX could be integrated)
const makeNormalize = (max) => (value) => {
  if (isNil(max) || max === 0) {
    return null;
  }
  return ((value - MIN) * 100) / (max - MIN);
};
const injectRating = (value, index) => [value, index + 1];
const dscRatingSort = ([, aRating], [, bRating]) => bRating - aRating;

// HOOKS
const useStyles = makeStyles((theme) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  scoreLine: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRoot: {
    flexDirection: 'row-reverse',
    marginRight: theme.spacing(2),
  },
  ratingIconFilled: {
    color: theme.palette.primary.main,
  },
  ratingIconEmpty: {
    visibility: 'hidden',
  },
  progressRoot: {
    flexGrow: '1',
    minWidth: theme.typography.h1.fontSize,
  },
}));

// COMPONENTS
// @FIXME move to @misakey/ui
const RatingScore = ({ distrRating, totalRating, className }) => {
  const classes = useStyles();

  const normalize = useMemo(
    () => makeNormalize(totalRating),
    [totalRating],
  );

  const percentDistrRating = useMemo(
    () => (isArray(distrRating)
      ? distrRating
        .map(normalize)
        .map(injectRating)
        .sort(dscRatingSort)
      : []),
    [distrRating, normalize],
  );


  return (
    <Box className={clsx(className, classes.wrapper)}>
      {percentDistrRating.map(([count, rating]) => (
        <Box key={rating} className={classes.scoreLine}>
          <Rating
            value={rating}
            size="small"
            readOnly
            classes={{
              root: classes.ratingRoot,
              iconFilled: classes.ratingIconFilled,
              iconEmpty: classes.ratingIconEmpty,
            }}
          />
          <LinearProgress value={count} variant="determinate" classes={{ root: classes.progressRoot }} />
        </Box>
      ))}
    </Box>
  );
};

RatingScore.propTypes = {
  className: PropTypes.string,
  distrRating: PropTypes.arrayOf(PropTypes.number),
  totalRating: PropTypes.number,
};

RatingScore.defaultProps = {
  className: '',
  distrRating: null,
  totalRating: null,
};

export default RatingScore;
