import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';


import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import RatingScore from 'components/dumb/Rating/Score';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

// CONSTANTS
const DISTR_RATING = [
  0, 0, 0, 0, 0,
];

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardContentRoot: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  ratingIconFilled: {
    color: theme.palette.secondary.main,
  },
  scoreBlock: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  halfBlock: {
    flex: '1',
  },
}));

// COMPONENTS
const SummaryFeedbackCardSkeleton = ({ hideTitle, t }) => {
  const classes = useStyles();

  const title = useMemo(
    () => (hideTitle ? null : t('citizen__new:application.info.feedback.all')),
    [hideTitle, t],
  );

  return (
    <Box>
      {(!hideTitle) && (
        <CardHeader
          title={title}
        />
      )}
      <CardContent className={classes.cardContentRoot}>
        <Box mr={1} className={clsx(classes.scoreBlock, classes.halfBlock)}>
          <Box mr={1}>
            <Typography variant="h1" color="textPrimary" noWrap>
              <Skeleton variant="text" width={129} />
            </Typography>
          </Box>
          <Box mr={2}>
            <Typography variant="h6" color="textPrimary" noWrap>
              {t('common__new:on')}
              5
            </Typography>
          </Box>
          <Box ml="auto">
            <Typography variant="subtitle1" color="textPrimary" noWrap>
              {t('citizen__new:application.info.feedback.ratingCount', { count: '' })}
            </Typography>
          </Box>
        </Box>
        <RatingScore
          className={classes.halfBlock}
          distrRating={DISTR_RATING}
        />
      </CardContent>
    </Box>
  );
};

SummaryFeedbackCardSkeleton.propTypes = {
  t: PropTypes.func.isRequired,
  hideTitle: PropTypes.bool,
};

SummaryFeedbackCardSkeleton.defaultProps = {
  hideTitle: false,
};

export default withTranslation(['citizen__new', 'common__new'])(SummaryFeedbackCardSkeleton);
